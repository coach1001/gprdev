angular.module('appCg').controller('LoginCtrl',function(authenticationService,ngToast,$uibModalInstance){
  var vm = this;

  vm.loginFields = [{
    key : 'email',
    type : 'input',
    templateOptions: {
      type: 'email',
      label: 'Email address',
      placeholder : 'Enter mail',
      required : true
    }
  },{
    key : 'password',
    type : 'input',
    templateOptions:{
      type : 'password',
      label : 'Password',
      placeholder : 'Enter password',
      required : true
    }
  }];

  vm.loginFunc = function(){
      authenticationService.login(vm.login.email,vm.login.password).then(function success(response){      
      console.log(response);
      authenticationService.useCredentials(response.data.token,vm.login.email);
      authenticationService.storeCredentials(response.data.token,vm.login.email);
      ngToast.create({content: 'Login Successfull', timeout: 3000});
      $uibModalInstance.close(vm.login.email);
    },function error(response){
      authenticationService.isAuthenticated = false;
      ngToast.warning({content:'Login Failed, please check credentials', timeout: 3000});
    });
  };
});
