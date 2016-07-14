angular.module('appCg').controller('ApplicationsCtrl', function(applications, gprRestApi, $uibModal, uiGridConstants,lookup_calls_uigrid) {
  var vm = this;

  var unfilteredRows = angular.extend(applications);
  vm.applications = vm.rows = angular.extend(applications);

  vm.title = 'Applications';

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
      { name: 'id', displayName: 'Application', sort: { direction: uiGridConstants.ASC }, width: 120 },
      { name: 'call_reference', width: 200, filter: {selectOptions: lookup_calls_uigrid, type: uiGridConstants.filter.SELECT }},
      { name: 'name', displayName: 'Organisation' },
      { name: 'email_address' },
      { name: 'description', displayName: 'Application Status', width: 220 }
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
      templateUrl: 'partial/applications/modal/application-modal.html',
      controller: 'ApplicationModalCtrl as vm',
      size: 'lg',
      resolve: {
        operation: function res() {
          return operation;
        },
        application: function res(gprRestApi) {
          return gprRestApi.getRow('call_applications', id);
        },
        organisations: function res(gprRestApi) {
          return gprRestApi.getRows('grid_organisations', false);
        },
        places: function res(gprRestApi) {
          return gprRestApi.getRows('grid_places', false);
        },
        calls: function res(gprRestApi) {
          return gprRestApi.getRows('grid_calls', false);
        }
      }
    }).result.then(function(result) {
      console.log('modal closed');
    }, function(result) {
      gprRestApi.getRows('grid_applications', false).then(function success(res) {
        vm.options.data = vm.applications = res;
      });
    });
  };
});
