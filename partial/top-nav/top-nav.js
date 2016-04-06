angular.module('appCg').controller('TopNavCtrl', function ($uibModal, authenticationService,$state,loginModalService,$rootScope) {
  var vm = this;
  vm.navbarCollapsed = true;

  vm.loginFunc = function () {

    loginModalService().then(function (){

    }).catch(function (){

    });
  };

  vm.logoutFunc = function () {
    authenticationService.destroyUserCredentials();
    $state.go('home');
  };

  vm.registerFunc = function () {
    $uibModal.open({
      templateUrl: 'partial/user-registration/user-registration.html',
      controller: 'UserRegistrationCtrl as vm',
      size: 'md',
      resolve: {}
    }).result.then(function (result) {
      }, function (result) {
      });
  };
});
