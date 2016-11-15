angular.module('appCg').controller('KpiModalCtrl', function (kpi,
                                                             programmes,
                                                             kras,
                                                             targets,
                                                             operation,
                                                             gprRestApi,
                                                             ngToast,
                                                             $confirm,
                                                             $uibModalInstance,
                                                             $uibModal,
                                                             $filter, $interval) {


  var vm = this;

  if (operation === 'Create') {
    vm.kpi = {};
  } else if (operation === 'Update') {
    vm.kpi = angular.copy(kpi);
  }
  
  vm.operation = angular.extend(operation);

  vm.programmes = angular.extend(programmes);
  vm.kras = angular.extend(kras);
  vm.rows = angular.extend(targets);

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
      {name: 'month', type: 'date', cellFilter: 'date:\'MMMM yyyy\'' ,displayName: 'Month'},
      {name: 'target', displayName: 'Target'},
      {name: 'actual', displayName: 'Actual'}
    ],
    onRegisterApi: function (gridApi) {
      vm.gridApi = gridApi;

      gridApi.selection.on.rowSelectionChanged(null, function (row) {
        console.log(row.entity.id);
        vm.openModal(row.entity.id, 'Update');
      });
    }
  };

  vm.kpiFields = [{
    key: 'key_result_areas.programme',
    type: 'select',
    templateOptions: {
      label: 'Programme',
      valueProp: 'id',
      labelProp: 'code',
      required: true,
      options: vm.programmes
    },
    watcher: {
      listener: function (field, newValue, oldValue, scope) {
        if (newValue) {
          scope.fields[1].templateOptions.options = $filter('filter')(vm.kras, {programme: newValue});
        } else {

          scope.fields[1].templateOptions.options = [];
        }
      }
    }
  }, {
    key: 'key_result_area',
    type: 'select',
    templateOptions: {
      label: 'Key Result Area',
      valueProp: 'id',
      labelProp: 'code',
      required: true
    }
  }, {
    fieldGroup: [{
      className: 'col-xs-4 nopadding',
      key: 'code',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Code',
        placeholder: 'Programme Code',
        required: true
      }
    }, {
      className: 'col-xs-8 nopadding',
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name',
        placeholder: 'Programme Name',
        required: true
      }
    }]
  }, {
    key: 'description',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'Description',
      placeholder: 'Programme Description',
      rows: 3,
      required: false
    }
  }];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.kpi);
    delete body.key_result_areas;

    gprRestApi.updateCreateRow('key_performance_indicators', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.kpi.id = response.data.id;
      }
      vm.operation = 'Update';
      
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };

  vm.deleteRow = function () {
    gprRestApi.deleteRow('key_performance_indicators', vm.kpi.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });

  };

  vm.openModal = function (id, operation) {
    $uibModal.open({
      templateUrl: 'partial/kpis/modal/kpi-targets-modal.html',
      controller: 'KpiTargetsModalCtrl as vm',
      resolve: {
        target: function res(gprRestApi) {
          return gprRestApi.getRow('key_performance_indicators_targets', id, false);
        },
        operation: function res() {
          return operation;
        },
        kpiId: function res() {
          return vm.kpi.id;
        }
      }
    }).result.then(function (result) {
        console.log('modal closed');
      }, function (result) {
        gprRestApi.getRowsFilterColumn('key_performance_indicators_targets',
          'key_performance_indicator', vm.kpi.id, false).then(function success(response) {
            vm.rows = angular.extend(response);
            vm.options.data = vm.rows;
          });
      });
  };

});
