var forumCtrls = angular.module('ForumControllers', [
  'NewsControllerUtils'
]);

forumCtrls.controller('SiteController', ['$scope', '$rootScope', 'Navigationstate', function($scope, $rootscope, navState){
  $scope.templates = {};
  
  $scope.templates.footer = "../partials/footer.html";

  $scope.navstate = navState.getState();
}]);

forumCtrls.controller('NewsController', ['$scope', '$filter', '$location','Article', 'NewsSession', function($scope, $filter, $location, Article, NewsSession){
    function loadArticles (date, newer) {
            $scope.isLoading = true;
            var articles = Article.query({date:date, newer: newer}).$promise.then(function(articles) {
              if(articles.length > 0) {
                $scope.articles =  $filter('orderBy')(articles, 'published', true);
                for (var index = 0; index < $scope.articles.length; index++) {
                  var article = $scope.articles[index];
                  article.setTheme($scope.articles);
                  console.log("HASIMG ",article.hasImg);
                };
              }
            });
        };

    if(NewsSession.articles) {
      $scope.articles = NewsSession.articles;
    } else {
      loadArticles();
    }

    $scope.newerArticles = function() {
       var newerArticles = $scope.articles[0];
       loadArticles(newerArticles.published, true);
    };


    $scope.olderArticles = function() {
       var oldestArticlePos = $scope.articles.length-1;
       var olderArticle = $scope.articles[oldestArticlePos];
       loadArticles(olderArticle.published, false);
    };

    $scope.setSelectedArticle = function(article) {
      NewsSession.selectedArticle = article;
      NewsSession.articles = $scope.articles;
      $location.path('/news/'+article._id);
    };

}]);


forumCtrls.controller('NewsArticleController', ['$scope', '$filter', '$location', 
  '$routeParams', '$sce', 'Article', 'NewsSession', 'CFSiteTheming', 
  function($scope, $filter, $location,
  $routeParams, $sce, Article, NewsSession, CFSiteTheming){
    
  $scope.article = NewsSession.selectedArticle || Article.get({articleId: $routeParams.articleId});


  $scope.currentTheme = CFSiteTheming.getCurrentTheme($scope.article._id) || CFSiteTheming.getThemes()[0];


  console.log( $scope.currentTheme.class.block);
  $scope.getArticleBody = function (){
        return $sce.trustAsHtml($scope.article.body);
  }

  $scope.goBack = function () {
    $location.path("/news");
  }

  $scope.articleUrl = $location.absUrl();
      
}]);