angular.module('appCg').controller('UserValidationCtrl',function(validation_success){
  var vm=this;
  vm.validation_state = angular.extend(validation_success);
  vm.title = "User Validation";
});
