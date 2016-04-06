angular.module('appCg').controller('UserRegistrationCtrl', function (authenticationService,ngToast,$uibModalInstance) {
  var vm = this;
  vm.registrationFields = [
    {
      key: 'email',
      type: 'input',
      templateOptions: {
        type: 'email',
        label: 'Email Address',
        required: true
      }
    },
    {
      key: 'confirmEmail',
      optionsTypes: ['matchField'],
      model: vm.registration,
      type: 'input',
      templateOptions: {
        type: 'email',
        label: 'Confirm Email',
        placeholder: 'Please re-enter your email',
        required: true
      },
      data: {
        fieldToMatch: 'email',
        modelToMatch: vm.registration,
        matchFieldMessage: '$viewValue + " does not match " + options.data.modelToMatch.email'
      }
    },
    {
      key: 'password',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: 'Password',
        placeholder: 'Must be at least 3 characters',
        required: true,
        minlength: 3
      }
    },
    {
      key: 'confirmPassword',
      type: 'input',
      optionsTypes: ['matchField'],
      model: vm.registration,
      templateOptions: {
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Please re-enter your password',
        required: true
      },
      data: {
        fieldToMatch: 'password',
        modelToMatch: vm.registration
      }
    }
  ];

  vm.registerFunc = function(){
    authenticationService.register(vm.registration.email,vm.registration.password).then(function success(response){
      ngToast.create({content: 'Registration Successful, please check your email for Validation Link', timeout: 8000});
      $uibModalInstance.dismiss();
    },function error(response){
      if(response.data.code === '23505'){
        ngToast.warning({content:'Registration Failed, email already being used', timeout: 4000});
      }
    });
  };

});
