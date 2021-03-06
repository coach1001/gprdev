angular.module('appCg').controller('PersonSelectModalCtrl',function($scope,persons, gprRestApi, $uibModal,$uibModalInstance,id){
	var vm = this;
    vm.title = 'Persons';
    var unfilteredRows = angular.extend(persons);
    vm.persons = vm.rows = angular.extend(persons);
    
    //vm.person_id = angular.copy(id);
    
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
            { name: 'title'},
            { name: 'first_names' },
            { name: 'last_name' },
            { name: 'role'},
            { name: 'email_address'}            
        ],
        onRegisterApi : function(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(null, function(row) {
            var msg = 'row selected ' + row.isSelected;            
        	$uibModalInstance.close(row.entity);
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
                roles:function res(){
                    return gprRestApi.getRows('lookup_roles',false);
                },                
                operation: function res() {
                    return operation;
                },
                users: function res(gprRestApi){
                    return gprRestApi.getRows('users',false);
                },
                contact : function res(){
                    return false;
                },
                assign : function res(){
                    return true;
                },
                p_titles : function res(gprRestApi){
                    return gprRestApi.getRows('personal_titles',false);
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