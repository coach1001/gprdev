angular.module('appCg').directive('fileOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});

angular.module('appCg').controller('UploadFileCtrl',function(Upload,
   $sce,
   $scope,
   $uibModalInstance,
   ngToast,
   fileId,
   createFile,
   title,
   config,
   fileUploadDownload,
   saveName){

  $scope.fileModel = null;
  $scope.fileId = angular.extend(fileId);
  $scope.title = angular.extend(title);
  $scope.createFile = angular.extend(createFile);
  $scope.fileSelected = false;
  $scope.fileName = '';

  $scope.fileChanged = function($event){

    $scope.fileName = $event.target.files[0].name || '';
    if($scope.fileName){
       $scope.fileSelected = true;
    }else{
      $scope.fileSelected = false;
    }
  };

  $scope.previewFile = function(){
    if(!$scope.createFile){
      $scope.previewURL=$sce.trustAsResourceUrl(config.file_server_base_url+'/file?fileId='+ $scope.fileId);
    }else{
      $scope.previewURL='';
    }
  };

  $scope.submit = function(){
    var extension = $scope.fileModel.name.split('.').pop().toLowerCase();
    var newFileName = saveName+'.'+extension;
    $scope.fileModel.saveAsFileName = newFileName;

    if($scope.createFile){
      $scope.previewURL = $sce.trustAsResourceUrl('');
      fileUploadDownload.createFile($scope.fileModel).then( function(res){
        $scope.fileId = res.data.fileId;
        $scope.previewURL=$sce.trustAsResourceUrl(config.file_server_base_url+'/file?fileId='+ $scope.fileId);
        $scope.fileSelected = false;
        $scope.createFile = false;
        $scope.fileName = '';
      });
    }else{
      $scope.previewURL = $sce.trustAsResourceUrl('');
      fileUploadDownload.updateFile($scope.fileId, $scope.fileModel).then( function(res){
        $scope.previewURL=$sce.trustAsResourceUrl(config.file_server_base_url+'/file?fileId='+ $scope.fileId);
        $scope.fileSelected = false;
        $scope.fileName = '';
      });
    }
  };

  $scope.delete = function() {
    fileUploadDownload.deleteFile($scope.fileId).then( function(res){
      ngToast.warning({ content: 'File Deleted Successfully', timeout: 4000 });
      $uibModalInstance.dismiss({
        fileDeleted: true
      });
    });
  };

  $scope.view = function() {
      fileUploadDownload.previewInTab($scope.fileId);
      $uibModalInstance.dismiss({
        fileDeleted: false,
        fileId: $scope.fileId > 0 ? $scope.fileId : null
      });
  };

  $scope.close = function() {
    $uibModalInstance.dismiss({
      fileDeleted: false,
      fileId: $scope.fileId > 0 ? $scope.fileId : null
    });
  };

  $scope.previewFile();
});
