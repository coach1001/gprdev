angular.module('appCg').controller('KraModalCtrl', function(
    kra,
    programmes,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.kra = {}; } else if (operation === 'Update') { vm.kra = angular.extend(kra); }

    vm.operation = angular.extend(operation);
    vm.programmes = angular.extend(programmes);

    vm.kraFields = [{
        key: 'programme',
        type: 'select',
        templateOptions: {
            label: 'Programme',
            valueProp: 'id',
            labelProp: 'code',
            required : true,
            options: vm.programmes
        }
    }, {
        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'code',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Code',
                placeholder: 'KRA Code',
                required: true
            }
        }, {
            className: 'col-xs-8 nopadding',
            key: 'name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Name',
                placeholder: 'KRA Name',
                required: true
            }
        }]
    }, {
        key: 'description',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Description',
            placeholder: 'Programme Description',
            rows: 3,
            required: false
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.kra);

        gprRestApi.updateCreateRow('key_result_areas', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.kra.id = response.data.id; }
            vm.operation = 'Update';
        }, function error() {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('key_result_areas', vm.kra.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error() {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
