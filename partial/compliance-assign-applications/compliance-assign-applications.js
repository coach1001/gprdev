angular.module('appCg').controller('AssignAssessorsApplicationsCtrl',function(applications_assessors, gprRestApi,uiGridConstants, $uibModal,complianceSection,lookup_calls_uigrid) {
  var vm = this;
  vm.title = 'Application Assessors';
  complianceSection = Number(complianceSection);
  
  vm.complianceSection = angular.copy(complianceSection);
  vm.buttonText = '';

  if(complianceSection === 2){
    vm.title = 'Application Admin & Tech Officers';    
  }else if(complianceSection === 3){
    vm.title = 'Application Relevance Officers';  
  }else if(complianceSection === 4){
    vm.title = 'Application Assessors';
  }else if(complianceSection === 7){
    vm.title = 'Application Due Diligence Officers';
  }
  
  var unfilteredRows = angular.extend(applications_assessors);
  vm.applications_assessors = vm.rows = angular.extend(applications_assessors);

  vm.options = {
    data : vm.rows,
    enableFiltering: true,
    enableRowSelection: true,
    enableRowHeaderSelection: false,
    multiSelect: false,
    modifierKeysToMultiSelect: false,
    noUnselect: true,
    enableGridMenu: true,
    columnDefs: [
      { name: 'application', width : 120},
      { name: 'call_reference' , width : 200,filter: {selectOptions: lookup_calls_uigrid, type: uiGridConstants.filter.SELECT }},
      { name: 'email_address',displayName:'Officer Email',width : 170},
      { name: 'first_names', displayName : 'Officer First Names',width : 180},
      { name: 'last_name', displayName : 'Officer Last Name',width : 180},
      { name: 'lead',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.lead"></checkbox>'},
      { name: 'completed',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.complete"></checkbox>'},
      { name: 'name', displayName: 'Application Organisation'}

    ],
    onRegisterApi : function(gridApi) {
      vm.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(null, function(row) {
        var msg = 'row selected ' + row.isSelected;
        vm.openModal(row.entity.id, 'Update');
      });}
  };

  vm.openModal = function(id, operation) {
    $uibModal.open({
      templateUrl: 'partial/compliance-assign-applications/modal/compliance-assign-application-modal.html',
      controller: 'AssignAssessorModalCtrl as vm',
      resolve: {
        applicationComplianceRecord: function res(gprRestApi) {
          return gprRestApi.getRow('application_compliance_officers', id);
        },
        applicationList: function res(gprRestApi) {
          //return gprRestApi.getRowsWithFEs('lookup_compliance_applications','&application_status=gte.'+vm.complianceSection,false);
          return gprRestApi.getRowsWithFEs('lookup_compliance_applications','&application_status=eq.'+vm.complianceSection,false);
        },
        officerList: function res(gprRestApi) {
          return gprRestApi.getRows('lookup_compliance_officers',false);
        },
        operation: function res() {
          return operation;
        },
        complianceSection : function res(){
          return vm.complianceSection;
        }
      }
    }).result.then(function(result) {
        console.log('modal closed');
      }, function(result) {
        gprRestApi.getRowsWithFEs('grid_assigned_applications','&compliance_section=eq.'+vm.complianceSection,false).then(function success(res){
          vm.options.data = vm.applications_assessors = res;
        });
      });
  };
  
});
