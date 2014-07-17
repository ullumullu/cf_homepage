var adminUtils = angular.module('AdminUtils', []);

/* SERVICES AND FACTORIES FOR THE ARTICLES SECTION */

adminUtils.service('articleUtils', function($http) {
   
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
               }
            }
   }

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