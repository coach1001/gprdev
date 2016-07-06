angular.module('appCg').controller('PersonModalCtrl', function(person,
    user,
    roles,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.person = {};
    } else if (operation === 'Update') {
        vm.person = angular.extend(person);
        vm.person.role = angular.extend(user.role);
        vm.person.login = angular.extend(user.email);
    }

    vm.roles = angular.extend(roles);

    vm.operation = operation;
    vm.personFields = [{
        key: 'login',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'User Login',
            placeholder: '',
            disabled: true
        }
    }, {
        key: 'first_names',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'First Names',
            placeholder: 'First Names',
            required: true
        }
    }, {
        key: 'last_name',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Last Name',
            placeholder: 'Last Name',
            required: true
        }
    }, {
        key: 'email_address',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Email Address',
            placeholder: 'Email Address',
            required: true
        }
    }, {
        key: 'role',
        type: 'select',
        templateOptions: {
            label: 'Role',
            valueProp: 'rolname',
            labelProp: 'rolname',
            placeholder: 'Role',
            required: false,
            options: vm.roles
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.person);
        console.log(body);

        gprRestApi.updateCreateRow('persons', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.person.id = response.data.id;
            }
            console.log(vm.person);

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };
    vm.deleteRow = function() {
        gprRestApi.deleteRow('persons', vm.person.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
