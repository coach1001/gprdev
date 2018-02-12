angular.module('appCg').controller('ProjectPartnerBudgetModalCtrl', function(
  project_partner,
  partner_budget_schedule,
  $uibModal,
  gprRestApi,
  ngToast,
  $confirm,
  $uibModalInstance, uiGridConstants, uiGridGroupingConstants) {

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
    showColumnFooter: true,
    noUnselect: true,
    enableGridMenu: true,

    columnDefs: [
      { name: 'item', displayName: 'Budget Item', sort: { direction: uiGridConstants.ASC } },
      { name: 'implementation_item_desc', displayName: 'Implementation Item' },
      { name: 'description' },
      // {
      //   name: 'amount',
      //   treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
      //   cellFilter: 'currency:"R ":0',
      //   customTreeAggregationFinalizerFn: function(aggregation) {
      //     aggregation.rendered = aggregation.value;
      //   },
      //   aggregationHideLabel: false,
      //   footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue()|currency:"R ":0}}</div>'
      // }
      {
        field: 'amount',
        aggregationType: uiGridConstants.aggregationTypes.sum,
        aggregationHideLabel: false,
        cellFilter: 'currency:"R ":0',
        footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue()|currency:"R ":0}}</div>'
      }
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
        implementation_schedule: function res(gprRestApi) {

          return gprRestApi.getRowsFilterColumn('project_implementation_plans', 'project_partner', project_partner.id);
        },
        budget_schedule: function res(gprRestApi) {
          return gprRestApi.getRow('project_budgets', id);
        },
        partner_id: function res() {
          return project_partner.id;
        },
        operation: function res() {
          return operation;
        }
      }
    }).result.then(function(result) {
      console.log('modal closed');
    }, function(result) {
      gprRestApi.getRowsFilterColumn('grid_project_partner_budget', 'project_partner', project_partner.id).then(function success(res) {
        vm.options.data = vm.rows = vm.partner_budget_schedule = angular.extend(res);
      }, function error(res) {

      });
    });
  };

});
