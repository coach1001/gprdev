angular.module('appCg').controller('PmuAdvisoryNotesCtrl',function(applications,gprRestApi,$uibModal,uiGridConstants){
	var vm = this;

  var unfilteredRows = angular.extend(applications);
  vm.applications = vm.rows = angular.extend(applications);

  vm.title = 'Pmu Advisory Notes';

  vm.options = {
    data: vm.rows,
    enableFiltering: true,
    enableRowSelection: true,
    enableRowHeaderSelection: false,
    multiSelect: false,
    modifierKeysToMultiSelect: false,
    noUnselect: true,
    enableGridMenu: true,
    columnDefs: [
      { name:  'id', displayName : 'Reference', sort : {direction:uiGridConstants.ASC}},
      { name: 'call_reference' },
      //{ name: 'name', displayName: 'Organisation' },
      //{ name: 'email_address' },
      { name: 'pmu_advisory'}
    ],
    onRegisterApi: function(gridApi) {
      vm.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(null, function(row) {
        var msg = 'row selected ' + row.isSelected;
        vm.openModal(row.entity.id, 'Update');
      });
    }
  };

  vm.openModal = function(id, operation) {
    $uibModal.open({
      templateUrl: 'partial/pmu-advisory-notes/modal/pmu-advisory-note-modal.html',
      controller: 'PmuAdvisoryNoteModalCtrl as vm',
      size : 'lg',
      resolve: {
        operation: function res() {
          return operation;
        },
        application: function res(gprRestApi) {
          return gprRestApi.getRow('call_applications',id);
        },
      }
    }).result.then(function(result) {
        console.log('modal closed');
      }, function(result) {
        gprRestApi.getRows('grid_applications',false).then(function success(res){
          vm.options.data = vm.applications = res;
        });
      });
  };
});
