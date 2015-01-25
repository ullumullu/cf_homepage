var forumCtrls = angular.module('ForumControllers', [
  'NewsControllerUtils'
]);

forumCtrls.controller('SiteController', ['$scope', '$rootScope', 'Navigationstate', function($scope, $rootscope, navState){
  $scope.templates = {};
  
  $scope.templates.footer = "../partials/footer.html";

  $scope.navstate = navState.getState();
}]);

forumCtrls.controller('NewsController', ['$scope', '$rootScope', '$filter', '$location','Article', 'NewsSession', function($scope, $rootScope, $filter, $location, Article, NewsSession){
    
  
    function loadArticles (date, newer) {
            $scope.isLoading = true;
            var articles = Article.query({date:date, newer: newer}).$promise.then(function(articles) {
              if(articles.length > 0) {
                $scope.articles =  $filter('orderBy')(articles, 'published', true);
                for (var index = 0; index < $scope.articles.length; index++) {
                  var article = $scope.articles[index];
                  article.setTheme($scope.articles);
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

    /*==========  Global Actions  ==========*/
    
    $scope.help = false;

    var globalActions = {};

    globalActions[0] = {
      description : "Info",
      icon        : "glyphicon glyphicon-question-sign",
      onclick     : function(e) {console.log(e);$scope.help = !$scope.help},
      onblur      : function(e) {console.log(e);$scope.help = false;}
    }

    $rootScope.globalActions = globalActions;

}]);


forumCtrls.controller('NewsArticleController', ['$scope', '$rootScope', '$filter', '$location', 
  '$routeParams', '$sce', 'Article', 'NewsSession', 'CFSiteTheming', 
  function($scope, $rootScope, $filter, $location,
  $routeParams, $sce, Article, NewsSession, CFSiteTheming){
    
  $scope.article = NewsSession.selectedArticle || Article.get({articleId: $routeParams.articleId});


  $scope.currentTheme = CFSiteTheming.getCurrentTheme($scope.article._id) || CFSiteTheming.getThemes()[0];

  $scope.getArticleBody = function (){
        return $sce.trustAsHtml($scope.article.body);
  }

  $scope.goBack = function () {
    $location.path("/news");
  }

  $scope.articleUrl = $location.absUrl();

  /*==========  Global Actions  ==========*/
  
  var globalActions = {};

  $rootScope.globalActions = globalActions;
      
}]);

/**
 * Controller for the members.html site. 
 * @param  {[type]} $scope){                     }] [description]
 * @return {[type]}           [description]
 */
forumCtrls.controller('MembersController', ['$scope', '$rootScope', 'Member', 
  function($scope, $rootScope, Member){

  var defaultMember = {

  };

  var members = Member.get().$promise.then(
      function (resp) {
        members = resp.members;
      }
    );

  /**
   * Method Used to retreive the members.
   * @param  {[int]} index Of the member in the members list
   * @return {[Member]}    A single member
   */
  $scope.getMember = function(index) {
    if(members[index])
      return members[index];
    else
      return defaultMember;
  };

  /*==========  Global Actions  ==========*/
  
  $scope.asList = false;
  $scope.help = false;
  
  var globalActions = {};

  globalActions[0] = {
    description : "Info",
    icon        : "glyphicon glyphicon-question-sign",
    onclick     : function() {$scope.help = !$scope.help},
    onblur      : function() {$scope.help = false; console.log("BLUR");}
  }

  globalActions[1] = {
    description : "Show members as list",
    icon        : "glyphicon glyphicon-list",
    onclick     : function() {$scope.asList = !$scope.asList;}
  }

  $rootScope.globalActions = globalActions;

}]);

forumCtrls.controller('HomeController', ['$rootScope', 
  function($rootScope){

  /*==========  Global Actions  ==========*/
    
  var globalActions = {};

  $rootScope.globalActions = globalActions;

}]);

forumCtrls.controller('RentController', ['$scope', function($scope){
  $scope.myInterval = 10000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 600 + slides.length;
    slides.push({
      image: 'http://placekitten.com/g/' + newWidth + '/400',
      text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
        ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
    });
  };
  for (var i=0; i<6; i++) {
    $scope.addSlide();
  }
}]);