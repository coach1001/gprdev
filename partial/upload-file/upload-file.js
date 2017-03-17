function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);  
  /* jshint ignore:start */
  delete link;
  /* jshint ignore:end */
}

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }
    
  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


angular.module('appCg').controller('UploadFileCtrl',function($scope,$http){	
	
	$scope.upload = function(){				
		
		$http.post('http://localhost:3003/files', {
			filetype : $scope.file.filetype,
			data: $scope.file.base64
		},{ headers: {'Authorization':undefined} }).then( function succ(sr){
			var id = sr.headers('Location').split('.')[1];			
			$scope.view(id);
		}, function err(er){

		});		
	};

	$scope.view = function(id){
			$http.get('http://localhost:3003/files?id=eq.'+id+'&select=data,filetype',{ headers: {'Authorization': undefined } }).then( function succ(sr){
				var blob = b64toBlob(sr.data[0].data,sr.data[0].filetype,512);
				var blobUrl = URL.createObjectURL(blob);				
				window.open(blobUrl);				
		}, function err(er){

		});		
	
	};

});