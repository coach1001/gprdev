angular.module('appCg').controller('LoginCtrl',function(){
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


});
