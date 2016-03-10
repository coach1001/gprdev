angular.module('appCg').controller('OrganisationsCtrl', function(grid_organisations,gprRestApi, $uibModal, $filter, $state, uiGridConstants) {
    var vm = this;
    vm.title = 'Organisations';
   
    var unfilteredRows = angular.extend(grid_organisations.rows);
    vm.rows = angular.extend(grid_organisations.rows);
    vm.count = unfilteredRows.length;
   
    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [{
                name: 'code',
                sort: {
                    direction: uiGridConstants.ASC,
                    priority: 0,
                }
            },
            { name: 'name' },
            { name: 'web_site' },
            { name: 'email_address' },
            { name: 'referee'},
            { name: 'auditor'},
            { name: 'province'},
            { name: 'organisation_type'}
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
            $state.reload();
        });
    };
});
