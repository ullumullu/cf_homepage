var adminUtils = angular.module('AdminUtils', []);

/* SERVICES AND FACTORIES FOR THE ARTICLES SECTION */

adminUtils.service('articleUtils', function($http, $q, $window) {
   
   this.generateArticle = function (article) {
      return {
               title: article.title,
               title_short: article.title_short,
               author: article.author,
               author_edit: article.author,
               body:   article.body,
               abstract: article.abstract,
               comments: [],
               published: article.published || null,
               date: (Object.keys(article).length != 0) ? article.date || new Date() : null, // Jul 1, 2012 @ 18:32
               date_edit: new Date(), // Jul 1, 2012 @ 18:32
               status: article.status,
               visibility: article.visibility,
               tags: [],
               meta: {
                  votes: (article.meta) ? article.meta.votes || 0 : 0,
                   favs: (article.meta) ? article.meta.favs || 0 : 0
               },
               config: {
                  publish_fb: (article.config) ? article.config.publish_fb || false : false,
                  enablecomments: (article.config) ? article.config.enable_comments || false : false
               },
               hasImg: article.hasImg || false
            }
   }

   this.generateImage = function(file) {
    var deferred = $q.defer();

    if(angular.isObject(file) && file instanceof $window.File) {  
      var reader = new FileReader();
      reader.onload = onLoadFile;
      reader.onerror = onErrorLoadFile;
      reader.readAsDataURL(file);
    } else {
      deferred.resolve();
    }
    
    function onLoadFile(event) {
      resizeBase64Img(event.target.result, 300, 300).then(function(newImg) {
       deferred.resolve(newImg);
      });
    }

    function onErrorLoadFile(err) {
      deferred.reject(err);
    }

    function resizeBase64Img(base64, width, height) {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext("2d");
      var deferred = $q.defer();
      $("<img/>").attr("src", base64).load(function() {
          context.scale(width/this.width,  height/this.height);
          context.drawImage(this, 0, 0); 
          deferred.resolve(canvas.toDataURL());               
      });
      return deferred.promise;    
    }

    return deferred.promise;
   };

   this.deleteArticle = function(article, callback) {
      if(article && callback) {
         var selectedid = article._id;
         $http.delete('managearticles/articles/'+selectedid)
          .success(function(data, status, headers, config) {
              if(status == 200) {
                callback();
              }
          });
      }
    };

  this.sendArticle = function(message, isNewArticle, articleId, actionType) {
    var deferred = $q.defer();
    var respmessage = "";
        if(isNewArticle) {
          // Use POST to insert a new draft or published article
          $http.post('/adminarea/managearticles/articles', message)
            .success(function(data, status, headers, config) {            
              if(actionType == 'saveDraft') {
                respmessage = 'Draft saved successfully!';
              } else if(actionType == 'publish') {
                respmessage = 'The article was successfully published!';
              } else if(actionType == 'update') {
                respmessage = 'The article was successfully updated!';
              }
              deferred.resolve({msg: respmessage, articledata: data});
            });
        } else {
              // Use PUT to update an article
              $http.put('/adminarea/managearticles/articles/'+articleId, message)
                 .success(function(data, status, headers, config) {                
                    var status = {};
                    if(actionType == 'saveDraft') {
                       respmessage = 'Draft saved successfully!';
                    } else if(actionType == 'publish') {
                       respmessage = 'The article was successfully published!';
                    } else if(actionType == 'update') {
                       respmessage = 'The article was successfully updated!';
                    }
                    deferred.resolve({msg: respmessage});
                 }).error(function(data, status, headers, config) {
                    deferred.reject('The article could not be found in the database... maybe someone deleted the article in parallel');
                 });
        }
        return deferred.promise;
  };

});


adminUtils.factory('sharedArticle', function(){
        var article= {};
        return {
            getArticle: function(){
                return article;
            },
            setArticle: function(value){
                article=value;
            }
        };
    });


adminUtils.factory('VerifyDeleteActionCtrl', function () {
   return function($scope, $modalInstance, content) {
         $scope.selected = content.selectedArticle;
         $scope.header = content.header;
         $scope.content = content.body;

         $scope.deleteArticle = function() {
            $modalInstance.close('deleteArticle');
         }

         $scope.cancelDeleteAction = function() {
            $modalInstance.dismiss('cancel');
         }
      };
});

adminUtils.factory('VerifyAcceptActionCtrl', function () {
   return function($scope, $modalInstance, content) {
         var _scope = {
            selected : content.selectedRequest,
            header : content.header,
            content : content.body,
         }; 
         $scope.acceptAction = _scope;

         $scope.acceptRequest = function(form) {
            if (form.$invalid) {
              return;
            }
            var selected = $scope.acceptAction.selected;
            selected.accepted = true;
            // Accepted
            selected.accepted_by = $scope.acceptAction.acceptedby;
            // Supervision
            selected.supervision = [];
            var supervision = $scope.acceptAction.supervision;
            if(supervision) {
              var supervisors = supervision.split(";");
              for (var indx = supervisors.length - 1; indx >= 0; indx--) {
                selected.supervision.push(supervisors[indx]);
              };
            }
            // Remark
            if($scope.acceptAction.remark) {
              var remarkby = $scope.acceptAction.remark.from,
                  comment = $scope.acceptAction.remark.comment;
              selected.remarks.push({
                  from: remarkby,
                  comment: comment
              });
            }
            $modalInstance.close(selected);
         }

         $scope.cancelAcceptAction = function() {
            $scope.acceptAction = {};
            $modalInstance.dismiss('cancel');
         }
      };
});

adminUtils.factory('VerifyRejectActionCtrl', function () {
   return function($scope, $modalInstance, content) {
         var _scope = {
            selected : content.selectedRequest,
            header : content.header,
            content : content.body,
         }; 
         $scope.rejectAction = _scope;

         $scope.rejectRequest = function(form) {
            if (form.$invalid) {
              return;
            }
            var selected = $scope.rejectAction.selected;
            selected.accepted = false;
            // Accepted
            selected.accepted_by = $scope.rejectAction.rejectedby;
            if($scope.rejectAction.remark) {
              // Remark
              var remarkby = $scope.rejectAction.remark.from,
                  comment = $scope.rejectAction.remark.comment;
              selected.remarks.push({
                  from: remarkby,
                  comment: comment
              });
            }
            $modalInstance.close($scope.rejectAction.selected);
         }

         $scope.cancelRejectAction = function() {
            $modalInstance.dismiss('cancel');
         }
      };
});


/*==========  Services for Renting  ==========*/


adminUtils.factory('RentResource', ['$resource', function($resource){
  var RentResource = $resource('/adminarea/managerent/rent/:rentRequestId', {status:'new', sc:'accepted'});

  angular.extend(RentResource.prototype, {
    getDetails: function() {
      // TODO: Maybe make the whole thing a two staged process
      // in order to save some bandwidth... (nobody will read all articles at once.
    }
  });

  return RentResource;
}]);