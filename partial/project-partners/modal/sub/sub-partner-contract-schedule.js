angular.module('appCg').controller('SubPartnerContractScheduleCtrl', function(payment_schedule,
    operation,
    contract_id,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.payment_schedule = {};
    } else if (operation === 'Update') {
        vm.payment_schedule = angular.extend(payment_schedule);
    }
    vm.operation = operation;

    vm.tabs = [{
        title: 'Contract Payment Details',
        index: 0,
        active: true,
        form: {
            options: {},
            model: vm.payment_schedule,
            fields: [{
                key: 'tranche_no',
                type: 'input',
                templateOptions: {
                    label: 'Tranche Number',
                    type: 'number',
                    required: true
                }
            }, {
                key: 'amount',
                type: 'input',
                templateOptions: {
                    label: 'Payment Amount',
                    type: 'number',
                    required: true
                }
            }, {
                key: 'payment_date',
                type: 'datepicker',
                templateOptions: {
                    label: 'Payment Date',
                    type: 'text',
                    required: true,
                    datepickerPopup: 'yyyy-MM-dd'
                }
            }]
        }
    }, {
        title: 'Ammendment Details',
        index: 1,
        active: true,
        form: {
            options: {},
            model: vm.payment_schedule,
            fields: [{
                    key: 'ammended',
                    type: 'checkbox2',
                    templateOptions: {
                        label: 'Ammended',
                        default: false,
                        required: false
                    }
                }, {
                    key: 'ammended_amount',
                    type: 'input',
                    templateOptions: {
                        label: 'Ammended Amount',
                        type: 'number',
                        required: false
                    }
                }, {
                    key: 'ammended_date',
                    type: 'datepicker',
                    templateOptions: {
                        label: 'Ammended Date',
                        type: 'text',
                        required: false,
                        datepickerPopup: 'yyyy-MM-dd'
                    }
                },
                {
                key: 'ammended_date',
                type: 'textarea',
                templateOptions: {
                    type: 'text',
                    label: 'Ammendment Reason',
                    rows: 3,
                    placeholder: 'Ammendment Reason',
                    required: false
                }
            }
            ]
        }
    }];


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.payment_schedule);
        body.contract = contract_id;
        
        gprRestApi.updateCreateRow('payment_schedule', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.payment_schedule.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('payment_schedules', vm.payment_schedule.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
