var membersCrtl = angular.module('ManageMembersController', ['GeneralUtils']);


membersCrtl.factory('Member', ['$resource', function($resource){
  var Member = $resource('/adminarea/managemembers/members/:memberId',
                {},
                {
                  'update': { method:'PUT' }
                });

  angular.extend(Member.prototype, {
    changeImage :  function(newImage) {
      this.img = newImage;  
    }
  });

  return Member;
}]);

membersCrtl.controller('ManageMembersCtrl', ['$scope', 'FileUploader', 'ImageUtils', 'Member', function ($scope, FileUploader, ImageUtils, Member) {
      
    /*==========  Member List  ==========*/
    $scope.members = Member.query();

    /*==========  File Upload  ==========*/

    var fileData = { 
        file: undefined,
        width: 150,
        height: 150,
        ready: false,
        uploaded: false,
        clear: false
    };
     
    var uploader = new FileUploader({
      queueLimit : 1
    });

    // FILTERS

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // EVENTS

    FileUploader.prototype.onAfterAddingFile = function(fileItem) {
      fileData.uploaded = true;
      fileData.clear = false;
      fileData.file = fileItem._file;
      fileData.ready = true;
      uploader.clearQueue();

    };

    // FUNCTIONS

    function revertFileUpload() {
      fileData.uploaded = false;
      fileData.file = undefined;
    }

    function clearFile() {
      fileData.uploaded = false;
      fileData.clear = true;
      fileData.file = undefined;
    }

    // SET

    $scope.fileData = fileData;
    $scope.revertFileUpload = revertFileUpload;
    $scope.clearFile = clearFile;
    $scope.uploader = uploader;

    /*==========  New Member  ==========*/
    
    var newmember = {};

    $scope.addNewMember= function(form) {
      // Trigger validation flag.
      $scope.submitted = true;
      
      // If form is invalid, return and let AngularJS show validation errors.
      if (form.$invalid) {
        $scope.errmessages = "The form isn't valid. Please check all required fields!"
        console.log("The form isn't valid. Please check all required fields!");
        return;
      }

      var imagepromise = ImageUtils.generateImg(fileData.file, 300, 300);
      imagepromise.then(function(image) {
        newmember.img = image;
        var newUser = new Member(newmember);
        newUser.$save(function(newMember, headers) {
          $scope.members.push(newMember);
          $scope.isAddNewMemberCollapsed = true;
        });
      });
    };

    $scope.newmember = newmember;

    /*==========  Delete Member  ==========*/
    

    $scope.deleteMember = function(Id, index) {
      Member.delete({memberId : Id});
      $scope.members.splice(index, 1);
    }

    /*==========  Edit Member  ==========*/
    

    $scope.editMember = function(member) {
      console.log("CHANGE");
      var imagepromise = ImageUtils.generateImg(member.img, 300, 300);
      imagepromise.then(function(image) {
        member.img = image;
        console.log(member.img);
        Member.update({memberId: member._id}, member);
      });
    }

}]);