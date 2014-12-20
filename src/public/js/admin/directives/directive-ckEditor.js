/*=================================
=            CK Editor            =
=================================*/

/**
 * ckEditor directive. Inits the div with a running
 * ckEditor. This is necessary in order to add specific
 * event listeners that update changes into the scope 
 * object.
 */

var ckEdit = angular.module('ckEdit', []);

ckEdit.directive('ckEditor', function() {
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