angular.module('appCg').service('loginModalService',function($uibModal,$rootScope) {

  function assignCurrentUser (user) {
    $rootScope.currentUser = user;
    $rootScope.isAuthenticated = true;
    return user;
  }

  return function() {
    var instance = $uibModal.open({
      templateUrl: 'partial/login/login.html',
      controller: 'LoginCtrl as vm',
      size: 'md',
      resolve: {}
    });

    return instance.result.then(assignCurrentUser);
  };

});
