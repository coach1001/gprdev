angular.module('appCg').controller('EvcMeetingAttendeeModalCtrl',function(evcAttendee,
																	evcId,
                                                                   operation,
                                                                   gprRestApi,
                                                                   ngToast,
                                                                   $confirm,
                                                                   $uibModalInstance) {

  var vm = this;

  if (operation === 'Create') {
    vm.evcAttendee = {};
    vm.evcAttendee.evc = angular.extend(evcId);
  } else if (operation === 'Update') {
    vm.evcAttendee = angular.extend(evcAttendee);
  }
  vm.operation = operation;

  vm.evcAttendeeFields = [ 
    {
    key: 'decision_narrative',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'Decision',
      placeholder: 'Decision',
      rows: 4,
      required: false
    }
  },
    {
    key: 'Time of Decision',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'Decision',
      placeholder: 'Decision',
      rows: 4,
      required: false
    }
  }
  ];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.evcAttendee);
    console.log(body);

    gprRestApi.updateCreateRow('evc_attendees', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.evcAttendee.id = response.data.id;
      }
      console.log(vm.evcAttendee);

      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };
  vm.deleteRow = function () {
    gprRestApi.deleteRow('evc_attendees', vm.evcAttendee.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });
  };
});
