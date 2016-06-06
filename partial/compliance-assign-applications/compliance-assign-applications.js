angular.module('appCg').controller('AssignAssessorsApplicationsCtrl',function(applications_assessors, gprRestApi, $uibModal) {
  var vm = this;
  vm.title = 'Application Assessors';
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
      { name: 'application' },
      { name: 'email_address',displayName:'Assessor Email'},
      { name: 'first_name' },
      { name: 'last_name' },
      { name: 'call_reference'},
      { name: 'name', displayName: 'Organisation' }
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
      templateUrl: 'partial/programmes/modal/programme-modal.html',
      controller: 'ProgrammeModalCtrl as vm',
      resolve: {
        programme: function res(gprRestApi) {
          return gprRestApi.getRow('programmes', id);
        },
        operation: function res() {
          return operation;
        }
      }
    }).result.then(function(result) {
        console.log('modal closed');
      }, function(result) {
        gprRestApi.getRows('grid_assign_assessor_application',false).then(function success(res){
          vm.options.data = vm.applications_assessors = res;
        });
      });
  };
});
