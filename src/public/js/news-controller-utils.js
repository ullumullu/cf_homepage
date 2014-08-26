/*=======================================
=            News Controller            =
=======================================*/

var newsCtrlUtil = angular.module('NewsControllerUtils', []);

newsCtrlUtil.factory('Article', ['$resource', function($resource){
    var selectedArticle;
    var Article = $resource('/newsarticles/:articleId', {
            date: '',
            newer: false
            });

    angular.extend(Article.prototype, {
        getDetails: function() {
          // TODO: Maybe make the whole thing a two staged process
          // in order to save some bandwidth... (nobody will read all articles at once.
        }    
    });

        return Article;
}])

newsCtrlUtil.value('NewsSession', {selectedArticle: undefined, articles: undefined});

/*-----  End of News Controller  ------*/