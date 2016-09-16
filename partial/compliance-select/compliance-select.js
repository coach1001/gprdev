angular.module('appCg').controller('ComplianceSelectCtrl',function(compliances,$state,complianceSection,uiGridConstants,$confirm,lookup_calls_uigrid,gu,la) {
  var vm = this;
  complianceSection = Number(complianceSection);
  if(complianceSection === 2){
    vm.title = 'Admin Compliances';    
  }else if (complianceSection === 3){
    vm.title = 'Relevance Checks';
  }else if (complianceSection === 4){
    vm.title = 'Assessments';
  }else if (complianceSection === 6){
    vm.title = 'Due Diligences';
  }
  vm.gu = {};
  
  vm.gu.state = angular.copy(gu);

  if(vm.gu.state === true){    
    vm.gu.title = 'Promote/Demote/Fail';
  }else{
    vm.gu.state = false;
  }

  vm.la = angular.copy(la);
  //console.log(vm.la);

  var unfilteredRows = angular.extend(compliances);
  vm.compliances = vm.rows = angular.extend(compliances);

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
      { name: 'application', displayName : 'Application' ,sort : {direction:uiGridConstants.ASC}},
      { name: 'call_reference' ,filter: {selectOptions: lookup_calls_uigrid, type: uiGridConstants.filter.SELECT} },
      { name: 'name', displayName : 'Organisation' },
      { name: 'province'},
      //{ name: 'complete', displayName: 'Completed?', type: 'boolean',cellTemplate: '<input disabled="true" type="checkbox" ng-model="row.entity.complete">'}
      { name : 'first_names', displayName : 'Officer First Name'},
      { name : 'last_name', displayName : 'Officer Last Name'},
      { name: 'lead',type: 'boolean',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.lead"></checkbox>'},
      { name: 'complete', displayName: 'Completed?', type: 'boolean',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.complete"></checkbox>'},
      { name: 'application_status_description', displayName : 'Application Status'}
    ],
    onRegisterApi : function(gridApi) {
      vm.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(null, function(row) {        
        var compliance_packet =
        {
          appId    : row.entity.id,
          application : row.entity.application,
          compliance_officer    : row.compliance_officer,
          complete    : row.entity.complete,          
        };
      if(complianceSection === 2){
        compliance_packet.compliance_template = row.entity.admin_compliance_template;
      }
      else if (complianceSection === 3){
        compliance_packet.compliance_template = row.entity.relevance_compliance_template;
      }
      else if (complianceSection === 4){
        compliance_packet.compliance_template = row.entity.assessment_compliance_template;
      }
      else if (complianceSection === 6){
        compliance_packet.compliance_template = row.entity.due_diligence_compliance_template;
        
      }
        

      if(compliance_packet.compliance_template){
        vm.openModal(compliance_packet);
      }else{
        $confirm({text:'This Section has No Assigned Template!',title : 'No Template Assigned'});
        vm.gridApi.selection.clearSelectedRows();
      }          
    });}
  };

  vm.openModal = function(compliance_packet) {
    $state.go('home.compliance',{templateId : compliance_packet.compliance_template, appId : compliance_packet.appId,application : compliance_packet.application, grants_unit : vm.gu.state, la : vm.la});                 
  };
});
