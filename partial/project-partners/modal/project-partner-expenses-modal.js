angular.module('appCg').controller('ProjectPartnerExpensesModalCtrl',function(
    project_partner,
    partner_expenses,
    $uibModal,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,uiGridGroupingConstants,uiGridConstants) {

    var vm = this;

    vm.project_partner = angular.extend(project_partner);
    vm.rows = vm.partner_expenses = angular.extend(partner_expenses);

    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        treeRowHeaderAlwaysVisible: false,
        showColumnFooter: true,
        columnDefs: [
            { name: 'request_id' , width: '8%'},
            { name: 'tranche_no', width: '8%'},
            { name: 'request_date', type: 'date', cellFilter: 'date:\'dd MMMM yyyy\'',width:'15%' },
            { name: 'amount',treeAggregationType: uiGridGroupingConstants.aggregation.SUM,footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue()|currency:"R ":0}}</div>',cellFilter: 'currency:"R ":0',width:'10%',customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
                },},
            { name: 'payment_reference'},
            { name: 'account_name'},
            { name: 'account_number', width: '15%'}
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
            templateUrl: 'partial/project-partners/modal/sub/sub-partner-expense.html',
            controller: 'SubPartnerExpenseCtrl as vm',
            size: 'lg',           
            resolve: {
                payment_types : function res(gprRestApi){
                        return gprRestApi.getRows('payment_types');
                },
                project_expense: function res(gprRestApi) {
                    return gprRestApi.getRow('project_expenses', id);
                },
                partner_tranches : function res(gprRestApi){
                    return gprRestApi.getRowsFilterColumn('lookup_tranche','partner_id',project_partner.id);
                },
                bank_accounts : function res(gprRestApi){
                    return gprRestApi.getRows('lookup_bank_accounts');
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
            gprRestApi.getRowsFilterColumn('grid_project_expenses', 'partner_id', project_partner.id).then(function success(res) {
             vm.options.data = vm.rows = vm.partner_expenses = angular.extend(res);

            }, function error(res) {

            });
        });
    };

});
