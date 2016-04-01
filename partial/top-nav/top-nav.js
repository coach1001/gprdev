angular.module('appCg').controller('TopNavCtrl', function ($uibModal) {
  var vm = this;
  vm.navbarCollapsed = true;

  vm.loginFunc = function () {
    $uibModal.open({
      templateUrl: 'partial/login/login.html',
      controller: 'LoginCtrl as vm',
      size : 'md',
      resolve: {}
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {

      });
  };
  vm.registerFunc = function () {
    $uibModal.open({
      templateUrl: 'partial/user-registration/user-registration.html',
      controller: 'UserRegistrationCtrl as vm',
      size : 'md',
      resolve: {}
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {

      });
  };
});
