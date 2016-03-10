angular.module('appCg').controller('CfpsCtrl', function(cfps, gprRestApi, $uibModal, $filter, $state) {
    var vm = this;
    vm.title = 'Calls for Proposals';

    var unfilteredRows = angular.extend(cfps.rows);
    vm.count = unfilteredRows.length;
    vm.rows = angular.extend(cfps.rows);

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
            { name: 'call_reference', displayName: 'Call Reference' },
            { name: 'name',displayName: 'Call Name'},
            { name: 'key_performance_indicators.key_result_areas.programmes.code', displayName: 'Programme Code' },
            { name: 'key_performance_indicators.key_result_areas.code', displayName: 'KRA Code' },
            { name: 'key_performance_indicators.code', displayName: 'KPI Code' }
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
            templateUrl: 'partial/cfps/modal/cfp-modal.html',
            controller: 'CfpModalCtrl as vm',
            //size : 'lg',
            resolve: {
                operation: function res() {
                    return operation;
                },
                programmes: function res(gprRestApi) {
                    return gprRestApi.getRows('programmes', false);
                },
                kras: function res(gprRestApi) {
                    return gprRestApi.getRows('key_result_areas', false);
                },
                kpis: function res(gprRestApi) {
                    return gprRestApi.getRows('key_performance_indicators', false);
                },
                assessment_templates: function(gprRestApi) {
                    return gprRestApi.getRows('assessment_templates', false);
                },
                call: function(gprRestApi) {
                    return gprRestApi.getRow('calls', id, true);
                }

            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            $state.reload();
        });
    };
});
