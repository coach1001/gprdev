angular.module('appCg').controller('SuburbModalCtrl', function(
    suburb,
    provinces,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.suburb = {}; } else if (operation === 'Update') { vm.suburb = suburb.selectedRow; }

    vm.operation = operation;
    vm.provinces = angular.copy(provinces.rows);


    vm.suburbFields = [{
        key: 'province',
        type: 'ui-select-single',
        templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Province',
            valueProp: 'id',
            labelProp: 'name',
            required: true,
            options: vm.provinces
        }
    }, {
       
        key: 'name',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Suburb Name',
            placeholder: 'Suburb Name',
            required: true
        }
    }, {
        className : 'row',
        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'po_box_code',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'PO Box Code',
                placeholder: 'PO Box Code',
                required: false
            }
        }, {
            className: 'col-xs-4 nopadding',
            key: 'street_code',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Street Code',
                placeholder: 'Street Code',
                required: false
            }
        }]
    },{
        className : 'row nopadding',
        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'latitude',
            type: 'input',
            templateOptions: {
                type: 'number',
                label: 'Latitude',
                placeholder: 'Latitude',
                required: false
            }
        }, {
            className: 'col-xs-4 nopadding',
            key: 'longitude',
            type: 'input',
            templateOptions: {
                type: 'number',
                label: 'Longitude',
                placeholder: 'Longitude',
                required: false
            }
        }]
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.suburb);

        delete body.provinces;
        delete body.places;

        gprRestApi.updateCreateRow('suburbs', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.suburb.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('suburbs', vm.suburb.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
