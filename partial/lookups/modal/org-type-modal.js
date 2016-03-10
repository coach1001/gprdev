angular.module('appCg').controller('OrgTypeModalCtrl',function(
    orgType,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.orgType = {}; } else if (operation === 'Update') { vm.orgType = orgType.selectedRow; }

    vm.operation = operation;



    vm.orgTypeFields = [{
        key: 'type',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Organisation Type',
            orgTypeholder: 'Organisation Type',
            required: true
        }
    }, {
       
        key: 'description',
        type: 'textarea',
        templateOptions: {
            type: 'text',
            label: 'Type Description',
            orgTypeholder: 'Type Description',
            required: true,
            rows : 3
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.orgType);

        delete body.provinces;

        gprRestApi.updateCreateRow('organisation_types', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.orgType.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('organisation_types', vm.orgType.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
