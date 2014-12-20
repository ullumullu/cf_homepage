/*=======================================
=            File Directive             =
=======================================*/

/**
 * File Upload
 */

var ckEdit = angular.module('CF-Fileupload', []);

ckEdit.directive('file', function(){
    return {
        scope: {
            file: '='
        },
        link: function(scope, el, attrs){
            el.bind('change', function(event){
                console.log("change");
                var files = event.target.files;
                var file = files[0];
                console.log(file);
                scope.file = file ? file : undefined;
                scope.$apply();
            });
        }
    };
});
