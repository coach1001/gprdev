angular.module('appCg').controller('ProjectReviewModalCtrl', function(project_report,report_schedule,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.project_report = {};
    } else if (operation === 'Update') {
        vm.project_report = angular.extend(project_report);
    }
    
    vm.project_report.report_schedule = report_schedule;
    
    vm.operation = operation;

    vm.project_reportFields = [ 
    {
        key: 'review_date',
        type: 'datepicker',
        templateOptions: {
            label: 'Review Date',
            type: 'text',
            datepickerPopup: 'yyyy-MM-dd',
            required: true
        }
    }, {
        key: 'narrative',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Review - Narrative',
            placeholder: 'Review',
            rows: 3,
            required: true
        }
    }, {
        key: 'satisfactory',
        type: 'checkbox2',
        templateOptions: {
            label: 'Satisfactory ?',
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.project_report);
        
        gprRestApi.updateCreateRow('project_reports', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.project_report.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };
    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_reports', vm.project_report.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
