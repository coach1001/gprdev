angular.module('appCg').controller('EvcMeetingModalCtrl', function(evcMeeting,
                                                             evcApplications,
                                                             evcAttendees,
                                                             operation,
                                                             gprRestApi,
                                                             ngToast,
                                                             $confirm,
                                                             $uibModalInstance,
                                                             $uibModal,
                                                             $filter, $interval) {


  var vm = this;

  if (operation === 'Create') {
    vm.evcMeeting = {};
  } else if (operation === 'Update') {
    vm.evcMeeting = angular.copy(evcMeeting);
  }
  
  vm.operation = angular.extend(operation);
  
  vm.applicationRows = angular.extend(evcApplications);
  vm.attendeeRows = angular.extend(evcAttendees);

  vm.applicationOptions = {
    data: vm.applicationRows,
    enableFiltering: true,
    enableRowSelection: true,
    enableRowHeaderSelection: false,
    multiSelect: false,
    modifierKeysToMultiSelect: false,
    noUnselect: true,
    enableGridMenu: true,
    columnDefs: [
      {name: 'application', displayName: 'Application #'},
      {name: 'approved'},
      {name: 'approved_amount'},
      {name: 'organisation'}
    ],
    onRegisterApi: function (gridApi) {
      vm.gridApiApplications = gridApi;

      $interval(function () {
        gridApi.core.handleWindowResize();
      },200,500);

      gridApi.selection.on.rowSelectionChanged(null, function (row) {
        //vm.openModal(row.entity.id, 'Update');
      });
    }
  };

  vm.attendeeOptions = {
    data: vm.attendeeRows,
    enableFiltering: true,
    enableRowSelection: true,
    enableRowHeaderSelection: false,
    multiSelect: false,
    modifierKeysToMultiSelect: false,
    noUnselect: true,
    enableGridMenu: true,
    columnDefs: [
      {name: 'first_names'},
      {name: 'last_name'},
      {name: 'email_address'}      
    ],
    onRegisterApi: function (gridApi) {
      vm.gridApiAttendees = gridApi;

      $interval(function () {
        gridApi.core.handleWindowResize();
      },200,500);

      gridApi.selection.on.rowSelectionChanged(null, function (row) {
        //vm.openModal(row.entity.id, 'Update');
      });
    }
  };

  vm.evcMeetingFields = [{      
      key: 'meeting_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Date of Meeting',
        type: 'text',
        datepickerPopup: 'yyyy-MM-dd',
        required : true
      }
    },
    {     
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name',
        placeholder: 'Meeting Name',
        required: true
      }
    }];
  

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.evcMeeting);
    delete body.key_result_areas;

    gprRestApi.updateCreateRow('evaluation_committee_meeting', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.evcMeeting.id = response.data.id;
      }
      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };

  vm.deleteRow = function () {
    gprRestApi.deleteRow('evaluation_committee_meeting', vm.evcMeeting.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });

  };

  vm.openModal = function (id, operation) {
    $uibModal.open({
      templateUrl: 'partial/evcMeetings/modal/evcMeeting-targets-modal.html',
      controller: 'evcMeetingTargetsModalCtrl as vm',
      resolve: {
        target: function res(gprRestApi) {
          return gprRestApi.getRow('key_performance_indicators_targets', id, false);
        },
        operation: function res() {
          return operation;
        },
        evcMeetingId: function res() {
          return vm.evcMeeting.id;
        }
      }
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {
        gprRestApi.getRowsFilterColumn('key_performance_indicators_targets',
          'key_performance_indicator', vm.evcMeeting.id, false).then(function success(response) {
            vm.rows = angular.extend(response);
            vm.options.data = vm.rows;
          });
      });
  };

});
