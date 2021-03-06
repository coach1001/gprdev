angular.module('appCg').controller('EvcMeetingModalCtrl', function(evcMeeting,
                                                             evcApplications,
                                                             evcAttendees,                                                             
                                                             operation,
                                                             gprRestApi,
                                                             ngToast,
                                                             $confirm,
                                                             $uibModalInstance,
                                                             $uibModal,
                                                             $filter, $interval,
                                                             meetingTypes) {

  var vm = this;

  if (operation === 'Create') {
    vm.evcMeeting = {};
  } else if (operation === 'Update') {
    vm.evcMeeting = angular.copy(evcMeeting);  
  }
  
  vm.operation = angular.copy(operation);  
  vm.applicationRows = angular.copy(evcApplications);
  vm.attendeeRows = angular.copy(evcAttendees);  
  vm.meetingTypes = angular.copy(meetingTypes);

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
      {name: 'application', displayName: 'Application'},      
      {name: 'organisation'},
      {name: 'amount_approved',type : 'number'},
      {name: 'approved',type: 'boolean',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.approved"></checkbox>'},
      {name: 'application_status_description', displayName: 'Application'}
    ],
    onRegisterApi: function (gridApi) {
      vm.gridApiApplications = gridApi;

      $interval(function () {        
        vm.gridApiApplications.core.handleWindowResize();
      },200,500);      
      vm.gridApiApplications.selection.on.rowSelectionChanged(null, function (row) {
        //console.log(row.entity);
        vm.openModalApplication(row.entity.id, 'Update',row.entity.application);
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
        //console.log(row.entity);
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
    },{
        key: 'approval_meeting_type',
        type: 'select',
        templateOptions: {
            label: 'Approval Meeting Type',
            valueProp: 'id',
            labelProp: 'name',
            required : true,
            options: vm.meetingTypes
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

    gprRestApi.updateCreateRow('approval_meetings', body, vm.operation).then(function success(response) {
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
    gprRestApi.deleteRow('approval_meetings', vm.evcMeeting.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });

  };

  vm.openModalApplication = function (id, operation,application) {    
    $uibModal.open({

      templateUrl: 'partial/evc-meetings/modal/evc-meeting-application-modal.html',
      controller: 'EvcMeetingApplicationModalCtrl as vm',
      size : 'lg',
      windowClass : 'big-modal',
      resolve: {
        application : function res(gprRestApi){
          return gprRestApi.getRow('call_applications', application, false);
        },
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
