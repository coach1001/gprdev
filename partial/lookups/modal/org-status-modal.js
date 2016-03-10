angular.module('appCg').controller('OrgStatusModalCtrl',function(
    orgStatus,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.orgStatus = {}; } else if (operation === 'Update') { vm.orgStatus = orgStatus.selectedRow; }

    vm.operation = operation;

    vm.orgStatusFields = [{
        key: 'status',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Status',
            orgStatusholder: 'Status',
            required: true
        }
    }, {
       
        key: 'description',
        type: 'textarea',
        templateOptions: {
            type: 'text',
            label: 'Status Description',
            orgStatusholder: 'Status Description',
            required: true,
            rows : 3
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.orgStatus);

        delete body.provinces;

        gprRestApi.updateCreateRow('organisation_statuses', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.orgStatus.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('organisation_statuses', vm.orgStatus.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
