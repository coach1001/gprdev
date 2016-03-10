angular.module('appCg').controller('ProgrammesCtrl', function(programmes, gprRestApi, $uibModal, $filter,$state) {
    var vm = this;
    vm.title = "Programmes";
    var unfilteredRows = angular.copy(programmes.rows);
    vm.rows = programmes.rows;

    vm.options = {
        rowHeight: 33,
        footerHeight: false,
        scrollbarV: false,
        headerHeight: 33,
        selectable: true,
        columns: [
            { name: "Code", prop: "code",sort: 'asc'},
            { name: "Name", prop: "name" },
            { name: "Start Date", prop: "start_date" },
            { name: "End Date", prop: "end_date" }
        ]
    };

    vm.filterChange = function() {
        vm.rows = $filter('filter')(unfilteredRows, vm.filter);
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
        },function(result){
            $state.reload();
        });
    };
});
