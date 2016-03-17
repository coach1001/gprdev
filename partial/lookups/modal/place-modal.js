angular.module('appCg').controller('PlaceModalCtrl',function(
    place,
    provinces,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.place = {}; } else if (operation === 'Update') { vm.place = angular.extend(place); }

    vm.operation = operation;
    vm.provinces = angular.extend(provinces);


    vm.placeFields = [{
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
            label: 'Place Name',
            placeholder: 'Place Name',
            required: true
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.place);

        delete body.provinces;

        gprRestApi.updateCreateRow('places', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.place.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('places', vm.place.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
