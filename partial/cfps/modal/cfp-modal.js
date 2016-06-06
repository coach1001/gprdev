angular.module('appCg').controller('CfpModalCtrl', function (programmes,
                                                             kras,
                                                             kpis,
                                                             compliance_templates,
                                                             call,
                                                             operation,
                                                             gprRestApi,
                                                             ngToast,
                                                             $confirm,
                                                             $uibModalInstance, $filter) {

  var vm = this;

  if (operation === 'Create') {
    vm.call = {};
  } else if (operation === 'Update') {
    vm.call = angular.copy(call);
  }

  vm.operation = angular.extend(operation);

  vm.programmes = angular.extend(programmes);
  vm.kras = angular.extend(kras);
  vm.kpis = angular.extend(kpis);
  vm.compliance_templates = angular.extend(compliance_templates);

  if (!vm.compliance_templates) {
    vm.compliance_templates = [];
  }

  vm.callFields = [{
    key: 'key_performance_indicators.key_result_areas.programmes.id',
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
    key: 'key_performance_indicators.key_result_areas.id',
    type: 'select',
    templateOptions: {
      label: 'Key Result Area',
      valueProp: 'id',
      labelProp: 'code',
      required: true,
      options: []
    },
    watcher: {
      listener: function (field, newValue, oldValue, scope) {
        if (newValue) {
          scope.fields[2].templateOptions.options = $filter('filter')(vm.kpis, {key_result_area: newValue});
        } else {
          scope.fields[2].templateOptions.options = [];
          vm.call.call_reference = undefined;
        }
      }
    }
  }, {
    key: 'key_performance_indicator',
    type: 'select',
    templateOptions: {
      label: 'Key Performance Indicator',
      valueProp: 'id',
      labelProp: 'code',
      required: true,
      options: []
    },
    watcher: {
      listener: function (field, newValue, oldValue, scope) {
        if (newValue) {
          gprRestApi.getRowsFilterColumn('kpi_next_call_reference', 'kpi_id', newValue, false).then(function success(response) {
            vm.call.call_reference = response[0].next_call_reference;
          });
        }
      }
    }
  }, {
    fieldGroup: [{
      className: 'col-xs-4 nopadding',
      key: 'call_reference',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Call Reference',
        placeholder: 'Call Reference',
        required: true,
        disabled: false
      }
    }, {
      className: 'col-xs-8 nopadding',
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name',
        placeholder: 'Call Name',
        required: true
      }
    }]
  }, {
    fieldGroup: [{
      className: 'col-xs-6 nopadding',
      key: 'call_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Call Closing Date',
        type: 'text',
        datepickerPopup: 'yyyy-MM-dd'
      }
    }, {
      className: 'col-xs-6 nopadding',
      key: 'evaluation_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Evaluation Date',
        type: 'text',
        datepickerPopup: 'yyyy-MM-dd'
      }
    }]
  },{
  fieldGroup : [
  {
    className: 'nopadding',
    key: 'admin_compliance_template',
    type: 'select',
    templateOptions: {
      label: 'Admin Compliance Template',
      valueProp: 'id',
      labelProp: 'name',
      required: false,
      options: vm.compliance_templates}
    }, 
  {
    className: 'nopadding',
    key: 'relevance_compliance_template',
    type: 'select',
    templateOptions: {
      label: 'Relevance Compliance Template',
      valueProp: 'id',
      labelProp: 'name',
      required: false,
      options: vm.compliance_templates}
    }, 
  {
    className: 'nopadding',
    key: 'assessment_compliance_template',
    type: 'select',
    templateOptions: {
      label: 'Assessment Compliance Template',
      valueProp: 'id',
      labelProp: 'name',
      required: false,
      options: vm.compliance_templates}
    }]}
    ];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.call);

    delete body.assessment_templates;
    delete body.key_performance_indicators;

    console.log(body);

    gprRestApi.updateCreateRow('calls', body, vm.operation).then(function success(response) {

      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.call.id = response.data.id;
      }

      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };

  vm.deleteRow = function () {
    gprRestApi.deleteRow('calls', vm.call.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });

  };
});
