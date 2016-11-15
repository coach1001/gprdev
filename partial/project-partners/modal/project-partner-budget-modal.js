angular.module('appCg').controller('ProjectPartnerBudgetModalCtrl',function(
    project_partner,
    partner_budget_schedule,    
    $uibModal,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,uiGridConstants) {

    var vm = this;

    vm.project_partner = angular.extend(project_partner);
    vm.rows = vm.partner_budget_schedule = angular.extend(partner_budget_schedule);
    
    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'item',sort: { direction: uiGridConstants.ASC} },
            { name: 'description'},
            { name: 'amount'}
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/project-partners/modal/sub/sub-partner-budget-schedule.html',
            controller: 'SubPartnerBudgetScheduleCtrl as vm',
            resolve: {
                budget_schedule: function res(gprRestApi) {
                    return gprRestApi.getRow('project_budgets', id);
                },
                partner_id: function res(){
                    return project_partner.id;
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {                     
            gprRestApi.getRowsFilterColumn('project_budgets', 'project_partner', project_partner.id).then(function success(res) {
            vm.options.data = vm.rows = vm.partner_budget_schedule = angular.extend(res);            
            }, function error(res) {

            });
        });
    };    

});