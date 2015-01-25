var forumApp = angular.module('forumApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ngResource',
  'ui.bootstrap',
  'ForumControllers',
  'MemberControllerUtils',
  'CF-GlobalAction',
  'CF-Calendar'
]);
/* CONFIGURATION TASKS */
forumApp.config(['$routeProvider', '$locationProvider', 
  function($routeProvider, $locationProvider) {
    $routeProvider.
     when('/', {
        templateUrl: '../partials/home.html',
        controller:'HomeController'
      }).
      when('/news', {
        templateUrl: '../partials/news.html',
        controller:'NewsController'
      }).
       when('/news/:articleId', {
        templateUrl: '../partials/news_article.html',
        controller:'NewsArticleController'
      }).
      when('/events', {
        templateUrl: '../partials/events.html'
      }).
      when('/rent', {
        templateUrl: '../partials/rent.html',
        controller:'RentController'
      }).
      when('/history', {  
        templateUrl: '../partials/news.html'
      }).
      when('/members', {
        templateUrl: '../partials/members.html'
      }).
      otherwise({
        redirectTo: '/'
      });

      $locationProvider.hashPrefix('!');
  }]).run(['$rootScope', '$location', 'Navigationstate', function($rootScope, $location, navState){
          var path = function() { return $location.path();};
        
          $rootScope.facebookAppId = '508276955969316';

          $rootScope.$watch(path, function(newVal, oldVal){
            $rootScope.activetab = newVal.split('/')[1];
            navState.getState().selectedTab = $rootScope.activetab;
            if(navState.getState().selectedTab === '') {
              navState.getState().visible = false;
            } else {
              navState.getState().visible = true;
            } 
          });
}]);  

/* SERVICES AND FACTORIES*/

forumApp.factory('Navigationstate', [function(){
  var state = {};

  state.selectedTab = '';

  return {
      getState: function(){
          return state;
      },
      setVisible: function(value){
          state.visible=value;
      }
  };
}]);

forumApp.value('Themes', [
  {name:"Orange", class: {block: "orange", inline:"orange-text" }},
  {name:"Green", class:{block: "green", inline:"green-text" }},
  {name:"Violett", class:{block: "violett", inline:"violett-text" }}
])

forumApp.factory('CFSiteTheming', ['Themes', function (themes){
  
  var currentTheme = [];

  function getThemes() {
    return themes;
  }

  function getCurrentTheme(containerId) {
    var theme = undefined;
    if(containerId) {
      theme = currentTheme[containerId];
    }
    return theme;
  }

  function setCurrentTheme(containerId, theme) {
    var name = theme.name;
    for (var index = 0; index < themes.length; index++) {
      var theme = themes[index];
      if(theme.name.match("^"+name+"$")) {
        currentTheme[containerId] = theme;
      }
    };
  }

  return {
    getThemes: getThemes,
    getCurrentTheme: getCurrentTheme,
    setCurrentTheme: setCurrentTheme
  }
}]);         

/* DIRECTIVES */

forumApp.directive('navigation', function() {
    return {
      templateUrl: '../partials/navigation.html',
      scope: {
        rerender: '@rerender'
      },
      controller: ['$scope', '$rootScope', '$location', 'Navigationstate', function($scope, $rootscope, $location, navState) {

        $scope.navstate = navState.getState();

        $scope.templates = {};
        $scope.templates.navigation = [
          {name: "News", href: "/news", id: "news"},
          {name: "Events", href: "/events", id:"events"},
          {name: "Vermietung", href: "/rent", id:"rent"},
          {name: "Geschichte", href: "/history", id:"history"},
          {name: "Mitglieder", href: "/members", id:"members"}
        ];

        $scope.setSelected = function(name, path) {
          if(name === 'home') {
            navState.setVisible(false);
          } else {
            navState.setVisible(true);
          }
          $location.path(path);
        };

        $scope.isSelected = function(name) {
          return navState.getState().selectedTab === name;
        }
      }],
      link: function(scope, ele, attrs) {

      }
    };
  });

forumApp.directive('clickAnimateFlash', ['$animate', '$parse', function($animate, $parse) {
  return {
    restrict: 'A',
    scope:true,
    link: function(scope, elm, attr) {
      var pipeChain = attr.clickAnimateFlash.split('|');
      var clickFn = $parse(pipeChain[0]);
      if(pipeChain[1]) {
        var animationEleID = pipeChain[1].trim();
        var animationClass = pipeChain[2] || 'zoom';
        elm.on('click', function (event){
          var animationele = $('#'+animationEleID);
          $animate.addClass(animationele, animationClass, function() {
              $animate.removeClass(animationele, animationClass, scope.$apply(clickFn));
          });
        });
      }
    }
  };
}]);

forumApp.directive('disqus', ['$window', '$location', function($window, $location){
  // Runs during compile
  return {
    scope: {
      disqus_shortname: '@disqusShortname',
      disqus_identifier: '@disqusIdentifier',
      disqus_title: '@disqusTitle',
      disqus_url: '@disqusUrl',
      disqus_category_id: '@disqusCategoryId',
      disqus_disable_mobile: '@disqusDisableMobile',
      readyToBind: "@"
    },
    restrict: 'E',
    templateUrl: '../partials/templates/disqus.html',
    link: function(scope, iElm, iAttrs, controller) {

      scope.$watch("readyToBind", function(isReady) {
                    // If the directive has been called without the 'ready-to-bind' attribute, we
                    // set the default to "true" so that Disqus will be loaded straight away.
                    if ( !angular.isDefined( isReady ) ) {
                        isReady = "true";
                    }
                    if (scope.$eval(isReady)) {
                        // put the config variables into separate global vars so that the Disqus script can see them
                        $window.disqus_shortname = scope.disqus_shortname;
                        $window.disqus_identifier = scope.disqus_identifier;
                        $window.disqus_title = scope.disqus_title;
                        $window.disqus_url = 'http://clubforum.de:3000/#!'+$location.path();
                        $window.disqus_category_id = scope.disqus_category_id;
                        $window.disqus_disable_mobile = scope.disqus_disable_mobile;

                        // get the remote Disqus script and insert it into the DOM, but only if it not already loaded (as that will cause warnings)
                        if (!$window.DISQUS) {
                            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                            dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
                            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                        } else {
                            $window.DISQUS.reset({
                                reload: true,
                                config: function () {
                                    this.page.identifier = scope.disqus_identifier;
                                    this.page.url = scope.disqus_url;
                                    this.page.title = scope.disqus_title;
                                }
                            });
                        }
                    }
                });
    }
  };
}]);

forumApp.directive('mailto', ['$location', '$compile', function($location, $compile){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      mail_to: '@receiver',
      mail_subject: '@messagesubject',
      mail_body: '@messagebody'
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    template: '<a class="" href="{{mailLink}}" ng-transclude></a>',
    // templateUrl: '',
    // replace: true,
    transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {
      $scope.$watch('[mail_to, mail_subject, mail_body]', 
        function() {
          var mail_subject = $scope.mail_subject;
          var mail_body_enc = encodeURIComponent($scope.mail_body);

          var mailLink = "mailto:";

          mailLink += ($scope.mail_to) ? $scope.mail_to : "";
          mailLink += "?";
          mailLink += (mail_subject) ? ("subject="+mail_subject) : "";
          mailLink += (mail_subject && mail_body_enc) ? "&" : "";
          mailLink += ($scope.mail_body) ? ("body="+mail_body_enc) : "";

          $scope.mailLink = mailLink;
        }, true);
    }
  }
}]);

forumApp.directive('fbLike', [
  '$window', '$rootScope', function ($window, $rootScope) {
  return {
      restrict: 'A',
      scope: {fbLike: '@'},
      link: function (scope, element, attrs) {
          renderLikeButton();

          function renderLikeButton() {
              if (!!attrs.fbLike && !scope.fbLike) {
                  // wait for data if it hasn't loaded yet
                  scope.$watch('fbLike', function () {
                      renderLikeButton();
                  });
                  return;
              } else {
                  element.html('<a class="share-on-link share-on-facebook" ' + (!!scope.fbLike ? ' href="https://www.facebook.com/dialog/share?app_id='+$rootScope.facebookAppId+'&display=popup&action_type=og.likes&href='+encodeURIComponent(scope.fbLike)+'&redirect_uri='+encodeURIComponent(scope.fbLike)+'"' : '') + '>Facebook</a>');
              }
          }
      }
  }
}]);

/* FILTER */



/* WORKAROUND */

forumApp.directive('disableAnimation', ['$animate', function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    }
}]);
