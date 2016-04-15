angular.module('appCg').controller('DoAssessmentSelectCtrl',function(assessments,$state) {
  var vm = this;
  vm.title = 'Assessments';
  var unfilteredRows = angular.extend(assessments);
  vm.assessments = vm.rows = angular.extend(assessments);

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
      { name: 'complete', displayName: 'Completed?', type: 'boolean',cellTemplate: '<input disabled="true" type="checkbox" ng-model="row.entity.complete">'}
    ],
    onRegisterApi : function(gridApi) {
      vm.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(null, function(row) {
        console.log(row);
        var assessment_packet =
        {
          appassId    : row.entity.id,
          application : row.entity.application,
          assessor    : row.entity.assessor,
          complete    : row.entity.complete,
          assessment_template : row.entity.assessment_template
        };
        vm.openModal(assessment_packet);
      });}
  };
  vm.openModal = function(assessment_packet) {
    console.log(assessment_packet);
    $state.go('home.do-assessment-assess',{templateId : assessment_packet.assessment_template, appassId : assessment_packet.appassId});
  };
});
