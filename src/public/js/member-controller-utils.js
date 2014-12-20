/*=======================================
=            News Controller            =
=======================================*/

var memberCtrlutil = angular.module('MemberControllerUtils', []);

memberCtrlutil.factory('Member', ['$resource', function($resource){
    
    var Member = $resource('/members', {});

    angular.extend(Member.prototype, {
        getDetails: function() {
          // TODO: Maybe make the whole thing a two staged process
          // in order to save some bandwidth... (nobody will read all articles at once.
        }
    });

    return Member;
}]);

/*-----  End of News Controller  ------*/