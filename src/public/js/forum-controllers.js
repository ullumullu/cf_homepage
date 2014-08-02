var forumCtrls = angular.module('ForumControllers', [
  'NewsControllerUtils'
]);

forumCtrls.controller('SiteController', ['$scope', '$rootScope', 'Navigationstate', function($scope, $rootscope, navState){
  $scope.templates = {};
  
  $scope.templates.footer = "../partials/footer.html";

  $scope.navstate = navState.getState();
}]);

forumCtrls.controller('NewsController', ['$scope', 'Article', function($scope, Article){
    $scope.loadArticles = function(date, newer) {
            $scope.isLoading = true;
            var articles = Article.query({date:date, newer: newer}).$promise.then(function(articles) {
              if(articles.length > 0) {
                $scope.articles = articles;
              }
            });
        };

    $scope.loadArticles();


    $scope.newerArticles = function() {
       var newerArticles = $scope.articles[0];
       $scope.loadArticles(newerArticles.published, true);
    };


    $scope.olderArticles = function() {
       var oldestArticlePos = $scope.articles.length-1;
       var olderArticle = $scope.articles[oldestArticlePos];
       console.log(olderArticle.date);
       $scope.loadArticles(olderArticle.published, false);
    };
}])