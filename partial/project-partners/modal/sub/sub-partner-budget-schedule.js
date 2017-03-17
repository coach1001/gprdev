angular.module('appCg').controller('SubPartnerBudgetScheduleCtrl', function(budget_schedule, implementation_schedule,
    operation,
    partner_id,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.budget_schedule = {};
    } else if (operation === 'Update') {
        vm.budget_schedule = angular.extend(budget_schedule);
    }
    vm.implementation_schedule = angular.extend(implementation_schedule);
    vm.operation = operation;
    console.log(vm.implementation_schedule);

    vm.tabs = [{
        title: 'Details',
        index: 0,
        active: true,
        form: {
            options: {},
            model: vm.budget_schedule,
            fields: [
                {
                    key: 'implementation_item',
                    type: 'select',
                    templateOptions: {
                        label: 'Implementation Item',
                        valueProp: 'id',
                        labelProp: 'item',
                        required: true,
                        options: vm.implementation_schedule
                    }
                },

                {
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
                }, {
                    key: 'amount',
                    type: 'input',
                    templateOptions: {
                        label: 'Item Amount',
                        type: 'number',
                        required: true
                    }
                }
            ]
        }
    }];


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.budget_schedule);
        body.project_partner = partner_id;

        gprRestApi.updateCreateRow('project_budgets', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.budget_schedule.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_budgets', vm.budget_schedule.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
