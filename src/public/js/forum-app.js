var forumApp = angular.module('forumApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ngResource',
  'ui.bootstrap',
  'ForumControllers'
]);

/* CONFIGURATION TASKS */
forumApp.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.
     when('/', {
        templateUrl: '../partials/home.html'
      }).
      when('/news', {
        templateUrl: '../partials/news.html',
      }).      
      when('/events', {
        templateUrl: '../partials/events.html'
      }).
      when('/rent', {
        templateUrl: '../partials/news.html'
      }).
      when('/history', {
        templateUrl: '../partials/news.html'
      }).
      when('/members', {
        templateUrl: '../partials/news.html'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]).run(['$rootScope', '$location', 'Navigationstate', function($rootScope, $location, navState){
          var path = function() { return $location.path();};
        
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
/*          console.log("navstate ", navState.getState().selectedTab);
          console.log("name ", name);*/
          return navState.getState().selectedTab === name;
        }
      }],
      link: function(scope, ele, attrs) {

      }
    };
  });

forumApp.directive('clickAnimateFlash', function($animate, $parse) {
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
});

/* FILTER */


