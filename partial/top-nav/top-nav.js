angular.module('appCg').controller('TopNavCtrl', function ($uibModal, authenticationService,$state,loginModalService,$rootScope) {
  var vm = this;
  vm.navbarCollapsed = true;
  vm.section = true;

  vm.loginFunc = function () {

    loginModalService().then(function (){

    }).catch(function (){

    });
  };

  vm.toggleSection = function(){
    if(vm.section === true){
      vm.section = false;
    }else{
      vm.section = true;
    }
    console.log(vm.section);
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
