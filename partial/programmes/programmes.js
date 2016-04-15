angular.module('appCg').controller('ProgrammesCtrl', function(programmes, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Programmes';
    var unfilteredRows = angular.extend(programmes);
    vm.programmes = vm.rows = angular.extend(programmes);

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
            { name: 'code' },
            { name: 'name' },
            { name: 'description' },
            { name: 'start_date',type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'end_date',type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' }
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
            gprRestApi.getRows('grid_programmes',false).then(function success(res){
                vm.options.data = vm.programmes = res;
            });
        });
    };
});
