var adminApp = angular.module('adminApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ArticlesControllers',
  'ui.bootstrap',
  'angularFileUpload',
  'CFfacebook'
]);


/* CONFIGURATION TASKS */
adminApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/managehome', {
        templateUrl: '../partials/admin/managehome.html',
        controller: 'ManageHomeCtrl'
      }).
      when('/managearticles', {
        templateUrl: '../partials/admin/managearticles.html',
        controller: 'ManageArticlesCtrl'
      }).
      when('/managearticles/:articleId', {
        templateUrl: '../partials/admin/article.html',
        controller: 'ArticleCtrl'
      }).
      otherwise({
        redirectTo: '/'
      })
  }]).run(['$rootScope', '$location', 'Facebook', function($rootScope, $location, Facebook){
          
          Facebook.init('508276955969316', '153097184732527', 'http://clubforum.de:3000/oauthcallback');

          var path = function() { return $location.path();};
          $rootScope.$watch(path, function(newVal, oldVal){
            $rootScope.activetab = newVal.split('/')[1];
          });
}]);                  

/* DIRECTIVES */

/**
  ckEditor directive, inits the div with a running ckEditor. This is 
  necessary in order to add specific event listeners that update changes
  into the scope object.
*/
adminApp.directive('ckEditor', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel) {
      var ck = CKEDITOR.replace(elm[0]);

      if (!ngModel) return;

      ck.on('instanceReady', function() {
        ck.setData(ngModel.$viewValue);
      });

      function updateModel() {
          scope.$apply(function() {
              ngModel.$setViewValue(ck.getData());
          });
      }

      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function(value) {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
});

adminApp.directive('clickAnimateFlash', function($animate, $parse) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var pipeChain = attr.clickAnimateFlash.split('|');
      var clickFn = $parse(pipeChain[0]);
      if(pipeChain[1]) {
        var animationEleID = pipeChain[1].trim();
        elm.on('click', function (event){
          var animationele = $('#'+animationEleID);
          $animate.addClass(animationele, 'hideEle', function() {
              $animate.removeClass(animationele, 'hideEle', scope.$apply(clickFn));
          });
        });
      }
    }
  };
});


adminApp.directive('thumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<div style="position:absolute; width:100%; height:100%; z-index:-1"><p style="color:white; text-align:center; width:100%; height:220px; padding-top: 70px;">loading...</p></div><canvas/>',
            link: function(scope, element, attributes) {
     
               scope.$watch(function() {return scope.file}, function(val) {
                element.find('p').show();

                if (!helper.support) return;

                var params = scope.$eval(attributes.thumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    element.find('p').hide();
                }
              }, true);

            }
        };
  }]);


/* FILTER */
adminApp.filter('listOfArticlesFilter',['$filter',function ($filter) {
  return function(input, searchText) {
    if(searchText) {
      var searchTextLow = searchText.toLowerCase();
      var filteredInput = [];
      for(articleCount in input) {
        var article = input[articleCount];
        var title = article.title.toLowerCase();
        var date = new Date(article.published);
        var now = new Date();
        if(article.status.indexOf('Draft') > -1) {
          title = title + " - draft";
        } else if((article.status == 'Published') && (+date <= +now)) {
          title = title + " - published";
        } else {
          title = title + " - pending";
        }
        if (title.indexOf(searchTextLow) > -1
          || article.author.toLowerCase().indexOf(searchTextLow) > -1
          || $filter('date')(article.date, 'medium').toLowerCase().indexOf(searchTextLow) > -1) {
          filteredInput.push(article);
        }
      }
      return filteredInput;
    } else {
      return input;
    }
  };
}]);


