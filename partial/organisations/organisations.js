angular.module('appCg').controller('OrganisationsCtrl', function(gprRestApi, $uibModal, $filter, $state, uiGridConstants) {
    var vm = this;
    vm.title = 'Organisations';
    var unfilteredRows = angular.extend(gprRestApi.tables[gprRestApi.getTableIndex('organisations')].rows);
    vm.rows = angular.extend(gprRestApi.tables[gprRestApi.getTableIndex('organisations')].rows);
    vm.count = unfilteredRows.length;
    console.log(vm.rows);
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
            { name: 'referee_.name', displayName: 'Referee' },
            { name: 'auditor_.name', displayName: 'Auditor' }
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
