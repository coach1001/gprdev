angular.module('appCg').controller('PmuAdvisoryNoteModalCtrl',function(application,
                                                                   operation,
                                                                   gprRestApi,
                                                                   ngToast,
                                                                   $confirm,
                                                                   $uibModalInstance) {

  var vm = this;

  if (operation === 'Create') {
    vm.application = {};
  } else if (operation === 'Update') {
    vm.application = angular.extend(application);
  }
 // console.log(vm.application);
//  vm.application.dates = {};
  vm.operation = operation;

/*
  if (vm.operation === 'Update' && vm.application.start_date && vm.application.end_date) {
    vm.application.dates.start_date_ = new Date(vm.application.start_date);
    vm.application.dates.end_date_ = new Date(vm.application.end_date);
  }
*/

  vm.applicationFields = [{
    key: 'pmu_advisory',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'PMU Advisory Note',
      placeholder: 'Note',
      rows: 7,
      required: true
    }
  }];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.application);
    console.log(body);

    gprRestApi.updateCreateRow('call_applications', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.application.id = response.data.id;
      }
      console.log(vm.application);

      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };
  vm.deleteRow = function () {
    gprRestApi.deleteRow('call_applications', vm.application.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });
  };
});
