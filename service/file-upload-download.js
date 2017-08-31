angular.module('appCg').factory('fileUploadDownload',function($http,$window,$sce,Upload) {

    var fileUploadDownload = {};

    fileUploadDownload.files = [];
    fileUploadDownload.file = null;
    fileUploadDownload.fileBaseURL = 'http://localhost:3000/get?fileId=';
    fileUploadDownload.previewURL =  $sce.trustAsResourceUrl('');
    fileUploadDownload.fileName = '';
    fileUploadDownload.cannotUpload = true;
    fileUploadDownload.progress = 0;

    fileUploadDownload.viewInTab = function(id){
        $window.open(fileUploadDownload.fileBaseURL+id);
    };
    fileUploadDownload.update = function (id) {
        Upload.upload({
            url: 'http://localhost:3000/update?fileId='+id,
            data:{
                file: fileUploadDownload.file
            }
        }).then(function (resp) {
          fileUploadDownload.fileName = '';
          fileUploadDownload.file = null;
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            fileUploadDownload.progress = 'progress: ' + progressPercentage + '% ';
        });
    };
    fileUploadDownload.removeFile = function (id) {
      $http({
          method: 'POST',
          url: 'http://localhost:3000/delete?fileId='+id
      }).then(function success(data, status, headers, config){
          console.log('File Deleted!');
      },function error(){
          console.log('Error Deleting File!');
      });
    };
    fileUploadDownload.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:3000/upload',
            data:{
                file:file
            }
        }).then(function (resp) {
            fileUploadDownload.fileName = '';
            fileUploadDownload.file = null;
            fileUploadDownload.cannotUpload = true;
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            fileUploadDownload.progress = 'progress: ' + progressPercentage + '% ';
        });
    };

    return fileUploadDownload;
});
