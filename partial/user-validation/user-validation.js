angular.module('appCg').controller('UserValidationCtrl',function($stateParams){
  var vm=this;
  vm.token = $stateParams.validation_token;
  vm.title = "User Validation";
});
