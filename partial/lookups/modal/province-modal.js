angular.module('appCg').controller('ProvinceModalCtrl',function(province, 
    operation, 
    gprRestApi, 
    ngToast, 
    $confirm, 
    $uibModalInstance) {
    
    var vm = this;

    if (operation === 'Create') { vm.province = {}; } else if (operation === 'Update') { vm.province = province.selectedRow; }


    vm.operation = operation;


    vm.provinceFields = [{

        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'code',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Code',
                placeholder: 'Province Code',
                required: true
            }
        }, {
            className: 'col-xs-8 nopadding',
            key: 'name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Name',
                placeholder: 'Province Name',
                required: true
            }
        }]
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.province);

        gprRestApi.updateCreateRow('provinces', body, vm.operation).then(function success(response) {

            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });


            if (vm.operation === 'Create') { vm.province.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('provinces', vm.province.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
