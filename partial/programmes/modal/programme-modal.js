angular.module('appCg').controller('ProgrammeModalCtrl', function (programme,
                                                                   operation,
                                                                   gprRestApi,
                                                                   ngToast,
                                                                   $confirm,
                                                                   $uibModalInstance) {

  var vm = this;

  if (operation === 'Create') {
    vm.programme = {};
  } else if (operation === 'Update') {
    vm.programme = angular.extend(programme);
  }
 // console.log(vm.programme);
//  vm.programme.dates = {};
  vm.operation = operation;

/*
  if (vm.operation === 'Update' && vm.programme.start_date && vm.programme.end_date) {
    vm.programme.dates.start_date_ = new Date(vm.programme.start_date);
    vm.programme.dates.end_date_ = new Date(vm.programme.end_date);
  }
*/

  vm.programmeFields = [{
    fieldGroup: [{
      className: 'col-xs-4 nopadding',
      key: 'code',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Code',
        placeholder: 'Programme Code',
        required: true
      }
    }, {
      className: 'col-xs-8 nopadding',
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name',
        placeholder: 'Programme Name',
        required: true
      }
    }]
  }, {
    key: 'description',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'Description',
      placeholder: 'Programme Description',
      rows: 3,
      required: false
    }
  }, {
    className: 'row marginRow',
    fieldGroup: [{
      className: 'col-xs-6 nopadding',
      key: 'start_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Start Date',
        type: 'text',
        datepickerPopup: 'yyyy-MM-dd'
      }
    }, {
      className: 'col-xs-6 nopadding',
      key: 'end_date',
      type: 'datepicker',
      templateOptions: {
        label: 'End Date',
        type: 'text',
        datepickerPopup: 'yyyy-MM-dd'
      }
    }]
  }];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.programme);
    console.log(body);

    gprRestApi.updateCreateRow('programmes', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.programme.id = response.data.id;
      }
      console.log(vm.programme);

      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };
  vm.deleteRow = function () {
    gprRestApi.deleteRow('programmes', vm.programme.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });
  };
});
