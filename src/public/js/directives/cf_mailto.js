var mailtoApp = angular.module('CF-MailTo', []);

mailtoApp.directive('mailto', ['$location', '$compile', function($location, $compile){
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