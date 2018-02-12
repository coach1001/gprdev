angular.module('appCg').factory('fileUploadDownload',function($http,$window,config, Upload) {

    var fileUploadDownload = {};

    fileUploadDownload.fileBaseURL = config.file_server_base_url;
    fileUploadDownload.progress = 0;

    fileUploadDownload.getFileList = function(){
      return $http.get(fileUploadDownload.fileBaseURL+'/file/list').then(function res(res){
        return res.data.files;
      },function err(res){});
    };

    fileUploadDownload.previewInTab = function(id){
        $window.open(fileUploadDownload.fileBaseURL+'/file?fileId='+id);
    };

    fileUploadDownload.updateFile = function (id, file) {
        return Upload.upload({
            url: fileUploadDownload.fileBaseURL+'/file?fileId='+id,
            method: 'PATCH',
            data:{
                file: file,
                saveAsFileName: file.saveAsFileName
            }
        }).then(function (res) {
          return res;
        }, function (res) {
          return res;
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            fileUploadDownload.progress = 'progress: ' + progressPercentage + '% ';
        });
    };
    fileUploadDownload.deleteFile = function (id) {
      return $http({
          method: 'DELETE',
          url: fileUploadDownload.fileBaseURL+'/file?fileId='+id
      }).then(function success(res, status, headers, config){
          return res;
      },function error(res){
          return res;
      });
    };
    fileUploadDownload.createFile = function (file) {
        return Upload.upload({
            url: fileUploadDownload.fileBaseURL+'/file',
            method: 'POST',
            data:{
                file:file,
                saveAsFileName: file.saveAsFileName
            }
        }).then(function (res) {
          return res;
        }, function (res) {
            return res;
        }, function (evt) {
            //console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            fileUploadDownload.progress = 'progress: ' + progressPercentage + '% ';
        });
    };
    return fileUploadDownload;
});
