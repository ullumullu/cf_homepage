/*=======================================
=            News Controller            =
=======================================*/

var newsCtrlUtil = angular.module('NewsControllerUtils', []);

newsCtrlUtil.factory('Article', ['$resource', 'CFSiteTheming', function($resource, CFSiteTheming){
    var selectedArticle;
    var Article = $resource('/newsarticles/:articleId', {
            date: '',
            newer: false
            });

    angular.extend(Article.prototype, {
        getDetails: function() {
          // TODO: Maybe make the whole thing a two staged process
          // in order to save some bandwidth... (nobody will read all articles at once.
        },
        setTheme: function(articles) {
            var themeName;
            switch(articles.indexOf(this)) {
                case -1: themeName = CFSiteTheming.getThemes()[0];  break;
                default: themeName = CFSiteTheming.getThemes()[articles.indexOf(this)]; break;
            }
            CFSiteTheming.setCurrentTheme(this._id, themeName);
        }
    });

    return Article;
}]);

newsCtrlUtil.value('NewsSession', {selectedArticle: undefined, articles: undefined});

/*-----  End of News Controller  ------*/