angular.module('appCg').controller('SubPartnerReportScheduleCtrl',function(reporting_schedule,
    operation,
    partner_id,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.reporting_schedule = {};
    } else if (operation === 'Update') {
        vm.reporting_schedule = angular.extend(reporting_schedule);
    }
    vm.operation = operation;

    vm.tabs = [{
        title: 'Details',
        index: 0,
        active: true,
        form: {
            options: {},
            model: vm.reporting_schedule,
            fields: [{
                key: 'report_no',
                type: 'input',
                templateOptions: {
                    type: 'number',
                    label: 'Report #',
                    placeholder: 'Report #',
                    required: true
                }
            },{
                key: 'due_date',
                type: 'datepicker',
                templateOptions: {
                    label: 'Due Date',
                    type: 'text',
                    required: true,
                    datepickerPopup: 'yyyy-MM-dd'
                }
            },{
                key: 'expiry_date',
                type: 'datepicker',
                templateOptions: {
                    label: 'Expiry Date',
                    type: 'text',
                    required: true,
                    datepickerPopup: 'yyyy-MM-dd'
                }
            }]
        }
    }];


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.reporting_schedule);
        body.project_partner = partner_id;

        gprRestApi.updateCreateRow('reporting_schedule', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.reporting_schedule.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('reporting_schedule', vm.reporting_schedule.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
