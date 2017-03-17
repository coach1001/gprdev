angular.module('appCg').controller('CfpsCtrl', function(cfps, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Calls for Proposals';

    var unfilteredRows = angular.extend(cfps);

    vm.calls = vm.rows = angular.extend(cfps);
    

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
            { name: 'programme_code', displayName: 'Programme Code' },
            { name: 'kra_code', displayName: 'KRA Code' },
            { name: 'kpi_code', displayName: 'KPI Code' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/cfps/modal/cfp-modal.html',
            controller: 'CfpModalCtrl as vm',
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
                compliance_templates: function(gprRestApi) {
                    return gprRestApi.getRows('compliance_templates', false);
                },
                call: function(gprRestApi) {
                    return gprRestApi.getRowWithFEs('calls', id, 'key_performance_indicators{*,key_result_areas{*,programmes{*}}}');
                }

            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_calls',false).then(function success(res){
                vm.options.data = vm.calls = res;
            });
        });
    };
});
