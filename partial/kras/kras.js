angular.module('appCg').controller('KrasCtrl', function(kras, gprRestApi, $uibModal, $filter, $state) {
    var vm = this;
    vm.title = 'Key Result Areas';

    var unfilteredRows = angular.extend(kras.rows);
    vm.count = unfilteredRows.length;
    vm.rows = kras.rows;

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
            { name: 'programme_code'},
            { name: 'code', displayName: 'KRA Code' },
            { name: 'name', displayName: 'KRA Name' },
            { name: 'description', displayName: 'Description' }
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
            templateUrl: 'partial/kras/modal/kra-modal.html',
            controller: 'KraModalCtrl as vm',
            resolve: {
                kra: function res(gprRestApi) {
                    return gprRestApi.getRow('key_result_areas', id);
                },
                operation: function res() {
                    return operation;
                },
                programmes: function res(gprRestApi) {
                    return gprRestApi.getRows('programmes', false);
                }

            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_kras',false).then(function success(res){
                vm.options.data = vm.kras = res.rows;
            });
        });
    };
});
