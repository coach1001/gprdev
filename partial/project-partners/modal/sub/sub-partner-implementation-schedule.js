angular.module('appCg').controller('SubPartnerImplementationScheduleCtrl',function(implementation_schedule,
    operation,
    partner_id,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.implementation_schedule = {};
    } else if (operation === 'Update') {
        vm.implementation_schedule = angular.extend(implementation_schedule);
    }
    vm.operation = operation;

    vm.tabs = [{
        title: 'Details',
        index: 0,
        active: true,
        form: {
            options: {},
            model: vm.implementation_schedule,
            fields: [{
                key: 'item',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'Item',
                    placeholder: 'Item',
                    required: true
                }
            }, {
                key: 'description',
                type: 'textarea',
                templateOptions: {
                    type: 'text',
                    label: 'Description',
                    rows: 3,
                    placeholder: 'Item Description',
                    required: false,                    
                }
            },{
                key: 'delivery_date',
                type: 'datepicker',
                templateOptions: {
                    label: 'Delivery Date',
                    type: 'text',
                    required: true,
                    datepickerPopup: 'yyyy-MM-dd'
                }
            }]
        }
    }];


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.implementation_schedule);
        body.project_partner = partner_id;

        gprRestApi.updateCreateRow('project_implementation_plans', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.implementation_schedule.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_implementation_plans', vm.implementation_schedule.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
