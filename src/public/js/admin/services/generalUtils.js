var genUtils = angular.module('GeneralUtils', []);

genUtils.factory('ImageUtils', ['$q', '$window', function($q, $window){

  var generateImage = function (file, width, height) {
    var deferred = $q.defer();

    if(angular.isObject(file) && file instanceof $window.File) {  
      var reader = new FileReader();
      reader.onload = onLoadFile;
      reader.onerror = onErrorLoadFile;
      reader.readAsDataURL(file);
    } else {
      deferred.resolve();
    }
    
    function onLoadFile(event) {
      if(angular.isNumber(width) && angular.isNumber(height)) {        
        resizeBase64Img(event.target.result, width, height)
          .then(function(newImg) {
            deferred.resolve(newImg);
          });
      } else {
         deferred.resolve(event.target.result);
      }
    }

    function onErrorLoadFile(err) {
      deferred.reject(err);
    }

    return deferred.promise;
   };


  var resizeBase64Img = function(base64, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var deferred = $q.defer();
    $("<img/>").attr("src", base64).load(function() {
        context.scale(width/this.width,  height/this.height);
        context.drawImage(this, 0, 0); 
        deferred.resolve(canvas.toDataURL());               
    });
    return deferred.promise;    
  }

  // Public API
  return {
    generateImg : generateImage,
    resizteImg : resizeBase64Img
  }

}]);

genUtils.factory('Member', ['$resource', function($resource){

    var Member = $resource('/newsMembers/:MemberId', {
            date: '',
            newer: false
            });

    angular.extend(Member.prototype, {
        getDetails: function() {
          // TODO: Maybe make the whole thing a two staged process
          // in order to save some bandwidth... (nobody will read all Members at once.
        },
    });

    return Member;
}]);