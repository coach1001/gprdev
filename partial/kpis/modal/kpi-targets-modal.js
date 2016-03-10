angular.module('appCg').controller('KpiTargetsModalCtrl', function(target,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,
    kpiId) {

    var vm = this;

    if (operation === 'Create') { vm.target = {}; } else if (operation === 'Update') { vm.target = target.selectedRow; }

    vm.target.dates = {};
    vm.operation = operation;

    if (vm.operation === 'Update' && vm.target.month) {
        vm.target.dates.month_ = new Date(vm.target.month);
    }

    vm.targetFields = [{
        key: 'dates.month_',
        type: 'datepicker',
        templateOptions: {
            label: 'For Month',
            type: 'text',
            datepickerPopup: 'yyyy-MM'
        }
    }, {
        key: 'target',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Target',
            placeholder: '',
            rows: 3,
            required: false
        }
    }, {
        key: 'actual',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Actual',
            placeholder: '',
            rows: 3,
            required: false
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.target);
        try {
            body.month = body.dates.month_.toSA();
        } catch (err) {
            body.month = null;
        }
        delete body.dates;
        body.key_performance_indicator = kpiId;

        gprRestApi.updateCreateRow('key_performance_indicators_targets', body, vm.operation).then(function success(response) {

            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });


            if (vm.operation === 'Create') { vm.target.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('key_performance_indicators_targets', vm.target.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
