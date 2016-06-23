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
      {name: 'organisation'},
      {name: 'amount_approved',type : 'number'},
      {name: 'approved',type: 'boolean',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.approved"></checkbox>'}
    ],
    onRegisterApi: function (gridApi) {
      vm.gridApiApplications = gridApi;

      $interval(function () {        
        vm.gridApiApplications.core.handleWindowResize();
      },200,500);      
      vm.gridApiApplications.selection.on.rowSelectionChanged(null, function (row) {
        vm.openModalApplication(row.entity.id, 'Update');
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
        vm.gridApiAttendees.core.handleWindowResize();
      },200,500);

      vm.gridApiAttendees.selection.on.rowSelectionChanged(null, function (row) {
        vm.openModalAttendee(row.entity.id, 'Update');
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

  vm.openModalApplication = function (id, operation) {
    $uibModal.open({
      templateUrl: 'partial/evc-meetings/modal/evc-meeting-application-modal.html',
      controller: 'EvcMeetingApplicationModalCtrl as vm',
      resolve: {
        evcApplication: function res(gprRestApi) {
          return gprRestApi.getRow('evc_applications', id, false);
        },
        evcApplicationLookup : function res(gprRestApi){
          return gprRestApi.getRows('lookup_evc_applications');
        },               
        operation: function res() {
          return operation;
        },        
        evcId: function res() {
          return vm.evcMeeting.id;
        }
      }
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {
        gprRestApi.getRowsFilterColumn('grid_evc_applications',
          'evc', vm.evcMeeting.id, false).then(function success(response) {
            vm.applicationRows = angular.extend(response);
            vm.applicationOptions.data = vm.applicationRows;
          });
      });
  };


  vm.openModalAttendee = function (id, operation) {
    $uibModal.open({
      templateUrl: 'partial/evc-meetings/modal/evc-meeting-attendee-modal.html',
      controller: 'EvcMeetingAttendeeModalCtrl as vm',
      resolve: {
        evcAttendee: function res(gprRestApi) {
          return gprRestApi.getRow('evc_attendees', id, false);
        },
        operation: function res() {
          return operation;
        },        
        evcId: function res() {
          return vm.evcMeeting.id;
        }
      }
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {
        gprRestApi.getRowsFilterColumn('grid_evc_attendees',
          'evc', vm.evcMeeting.id, false).then(function success(response) {
            vm.attendeeRows = angular.extend(response);
            vm.attendeeOptions.data = vm.attendeeRows;
          });
      });
  };


});
