angular.module('appCg').controller('CfpModalCtrl', function(programmes,
    kras,
    kpis,
    assessment_templates,
    call,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance, $filter) {

    var vm = this;

    if (operation === 'Create') { vm.call = {}; } else if (operation === 'Update') { vm.call = angular.copy(call); }

    vm.call.dates = {};
    vm.operation = angular.extend(operation);

    vm.programmes = angular.extend(programmes);
    vm.kras = angular.extend(kras);
    vm.kpis = angular.extend(kpis);
    vm.assessment_template = angular.extend(assessment_templates);

  if(!vm.assessment_templates){vm.assessment_templates = [];}

    if (vm.operation === 'Update' && vm.call.evaluation_date && vm.call.call_date) {
        vm.call.dates.evaluation_date_ = new Date(vm.call.evaluation_date);
        vm.call.dates.call_date_ = new Date(vm.call.call_date);
    }

    //console.log(vm.call);
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
            listener: function(field, newValue, oldValue, scope) {
                if (newValue) {
                    scope.fields[1].templateOptions.options = $filter('filter')(vm.kras, { programme: newValue });
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
            listener: function(field, newValue, oldValue, scope) {
                if (newValue) {
                    scope.fields[2].templateOptions.options = $filter('filter')(vm.kpis, { key_result_area: newValue });
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
            listener: function(field, newValue, oldValue, scope) {
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
                disabled: true
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
        className: 'row marginRow',
        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'dates.call_date_',
            type: 'datepicker',
            templateOptions: {
                label: 'Call Closing Date',
                type: 'text',
                datepickerPopup: 'yyyy-MM-dd'
            }
        }, {
            className: 'col-xs-4 nopadding',
            key: 'dates.evaluation_date_',
            type: 'datepicker',
            templateOptions: {
                label: 'Evaluation Date',
                type: 'text',
                datepickerPopup: 'yyyy-MM-dd'
            }
        }]
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.call);
        try {
            body.evaluation_date = body.dates.evaluation_date_.toSA();
            body.call_date = body.dates.call_date_.toSA();
        } catch (err) {
            body.evaluation_date = null;
            body.call_date = null;
        }
        delete body.dates;
        delete body.assessment_templates;
        delete body.key_performance_indicators;

        gprRestApi.updateCreateRow('calls', body, vm.operation).then(function success(response) {

            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });


            if (vm.operation === 'Create') { vm.call.id = response.data.id; }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('calls', vm.call.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
