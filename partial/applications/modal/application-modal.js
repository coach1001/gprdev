angular.module('appCg').controller('ApplicationModalCtrl', function (application,
                                                                     organisations,
                                                                     places,
                                                                     calls,
                                                                     operation,
                                                                     gprRestApi,
                                                                     ngToast,
                                                                     $confirm,
                                                                     $uibModalInstance) {

  var vm = this;

  if (operation === 'Create') {
    vm.kra = {};
  } else if (operation === 'Update') {
    vm.application = angular.extend(application);
  }

  vm.operation = angular.extend(operation);
  vm.organisations = angular.extend(organisations);
  vm.places = angular.extend(places);
  vm.calls = angular.extend(calls);

  vm.applicationFields = [{
    key: 'call',
    type: 'select',
    templateOptions: {
      label: 'Call Reference',
      valueProp: 'id',
      labelProp: 'call_reference',
      required: true,
      options: vm.calls
    }
  }, {
    key: 'applicant',
    type: 'select',
    templateOptions: {
      label: 'Applicant',
      valueProp: 'id',
      labelProp: 'name',
      required: true,
      options: vm.organisations
    }
  },{
        key: 'amount',
        type: 'input',
        templateOptions: {
            label: 'Amount Requested',
            type: 'number'
        }
    },{
    key: 'place',
    type: 'select',
    templateOptions: {
      label: 'Place',
      valueProp: 'id',
      labelProp: 'name',
      required: true,
      options: vm.places
    }
  }];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.application);

    gprRestApi.updateCreateRow('call_applications', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.application.id = response.data.id;
      }
      vm.operation = 'Update';
    }, function error() {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };

  vm.deleteRow = function () {
    gprRestApi.deleteRow('call_applications', vm.application.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error() {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });

  };

  vm.promote = function () {    
    vm.application.application_status = 2;    
    var body = angular.copy(vm.application);
    gprRestApi.updateCreateRow('call_applications',body,'Update').then(function success(response) {
      ngToast.create({content: 'Record Promoted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Promoted');
    }, function error() {
      ngToast.warning({content: 'Record Promotion Failed', timeout: 4000});
    });
  };

  vm.fail = function () {    
    vm.application.application_status = 21;    
    var body = angular.copy(vm.application);
    gprRestApi.updateCreateRow('call_applications',body,'Update').then(function success(response) {
      ngToast.warning({content: 'Record Failed Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Failed');
    }, function error() {
      ngToast.warning({content: 'Record Failure Failed', timeout: 4000});
    });
  };

});
