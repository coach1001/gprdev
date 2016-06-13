angular.module('appCg').controller('ComplianceSelectCtrl',function(compliances,$state,complianceSection) {
  var vm = this;
  
  if(complianceSection === 0)
    vm.title = 'Admin Compliances';
  else if (complianceSection === 1)
    vm.title = 'Relevance Checks';
  else if (complianceSection === 2)
    vm.title = 'Assessments';
  else if (complianceSection === 3)
    vm.title = 'Due Diligences';

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
      { name: 'application', displayName : 'Application Reference' },
      { name: 'call_reference' },
      { name: 'name', displayName : 'Organisation' },
      { name: 'province'},
      //{ name: 'complete', displayName: 'Completed?', type: 'boolean',cellTemplate: '<input disabled="true" type="checkbox" ng-model="row.entity.complete">'}
      { name: 'complete', displayName: 'Completed?', type: 'boolean',cellTemplate: '<checkbox disabled="true" ng-model="row.entity.complete"></checkbox>'}
      
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
      if(complianceSection === 0)
        compliance_packet.compliance_template = row.entity.admin_compliance_template;
      else if (complianceSection === 1)
        compliance_packet.compliance_template = row.entity.relevance_compliance_template;
      else if (complianceSection === 2)
        compliance_packet.compliance_template = row.entity.assessment_compliance_template;
      else if (complianceSection === 3)
        compliance_packet.compliance_template = row.entity.assessment_compliance_template;

        vm.openModal(compliance_packet);
      });}
  };
  vm.openModal = function(compliance_packet) {    
      $state.go('home.compliance',{templateId : compliance_packet.compliance_template, appId : compliance_packet.appId});  
  };
});
