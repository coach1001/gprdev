angular.module('appCg').controller('PersonsCtrl',function(persons, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Persons';
    var unfilteredRows = angular.extend(persons);
    vm.persons = vm.rows = angular.extend(persons);

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
            { name: 'id'},
            { name: 'user_login' },
            { name: 'first_names' },
            { name: 'last_name' },
            { name: 'role'},
            { name: 'email_address'}            
        ],
        onRegisterApi : function(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(null, function(row) {
            var msg = 'row selected ' + row.isSelected;
            vm.openModal(row.entity.id, 'Update',row.entity.email_address);
        });}
    };

    vm.openModal = function(id, operation,email_address) {
        $uibModal.open({
            templateUrl: 'partial/persons/modal/person-modal.html',
            controller: 'PersonModalCtrl as vm',
            resolve: {
                person: function res(gprRestApi) {
                    return gprRestApi.getRow('persons', id);
                },
                user:function res(){
                    return gprRestApi.getRowWithFE_2('users','&email=eq.'+ email_address);
                },
                roles:function res(){
                    return gprRestApi.getRows('lookup_roles',false);
                },                
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_persons',false).then(function success(res){
                vm.options.data = vm.person = res;
            });
        });
    };
});
