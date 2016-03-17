angular.module('appCg').controller('KpisCtrl', function(kpis, gprRestApi, $uibModal, $filter, $state) {
    var vm = this;
    vm.title = 'Key Perfomance Indicators';

    var unfilteredRows = angular.extend(kpis);
    vm.count = unfilteredRows.length;
    vm.rows = angular.extend(kpis);

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
            { name: 'programme_code', displayName: 'Programme Code' },
            { name: 'kra_code', displayName: 'KRA Code' },
            { name: 'code', displayName: 'KPI Code' },
            { name: 'name', displayName: 'KPI Name' },
            { name: 'description', displayName: 'Description' }
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
            templateUrl: 'partial/kpis/modal/kpi-modal.html',
            controller: 'KpiModalCtrl as vm',
            //size : 'lg',
            resolve: {
                kpi: function res(gprRestApi) {
                    return gprRestApi.getRow('key_performance_indicators', id, true);
                },
                operation: function res() {
                    return operation;
                },
                programmes: function res(gprRestApi) {
                    return gprRestApi.getRows('programmes', false);
                },
                kras: function res(gprRestApi) {
                    return gprRestApi.getRows('key_result_areas', false);
                },
                targets: function res(gprRestApi) {
                    return gprRestApi.getRowsFilterColumn('key_performance_indicators_targets',
                        'key_performance_indicator', id, false);
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_kpis',false).then(function success(res){
                vm.options.data = vm.kpis = res;
            });
        });
    };
});
