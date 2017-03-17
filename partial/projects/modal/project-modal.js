angular.module('appCg').controller('ProjectModalCtrl', function(project, kpis, persons, project_statuses, project_types, applications, operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,$uibModal) {

    var vm = this;

    vm.kpis = angular.extend(kpis);
    vm.applications = angular.extend(applications);
    vm.persons = angular.extend(persons);
    vm.project_types = angular.extend(project_types);
    vm.cfp_app_visible = true;

    if (operation === 'Create') {
        vm.project = {};
    } else if (operation === 'Update') {
        vm.project = angular.extend(project);
    }
    vm.operation = angular.extend(operation);
    //console.log(vm.project);
    //console.log(vm.applications);

    vm.tabs = [{
        title: 'General',
        active: true,
        form: {
            options: {},
            model: vm.project,
            fields: [{
                key: 'name',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'Project Name',
                    placeholder: 'Project Name',
                    required: true
                }
            }, {
                key: 'description',
                type: 'textarea',
                templateOptions: {
                    type: 'text',
                    label: 'Description',
                    rows: 3,
                    placeholder: 'Project Description',
                    required: true
                }
            },
                {                
                    //template: '<button class="btn btn-success span4" ng-click="openProjBen()">Beneficiaries</button><button class="btn btn-success span4" ng-click="openProjBen()">Beneficiaries</button></br>',
                    templateUrl: 'partial/projects/modal/buttons.html',
                    hideExpression: function($viewValue, $modelValue, scope) {
                        if (vm.operation === 'Create') {
                            return true;
                        } else {}
                    },
                    controller: ['$scope', function($scope) {
                        $scope.openProjBen = function() {
                            vm.openProjBen();
                        };
                        $scope.openProjAct = function() {

                        };
                        $scope.openProjTh = function() {

                        };
                    }]
                },
            ]
        }
    }, {
        title: 'Details',
        active: false,
        form: {
            options: {},
            model: vm.project,
            fields: [{
                    key: 'project_type',
                    type: 'ui-select-single',
                    templateOptions: {
                        optionsAttr: 'bs-options',
                        ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                        label: 'Project Type',
                        valueProp: 'id',
                        labelProp: 'type',
                        required: true,
                        options: vm.project_types
                    },
                    watcher: {
                        listener: function(field, newValue, oldValue, scope) {
                            var i = vm.project_types.getIndex('id', newValue);
                            if (vm.project_types[i].code === 'S') {
                                vm.cfp_app_visible = false;
                            } else {
                                vm.cfp_app_visible = true;
                            }

                        }
                    }

                },
                {
                    key: 'call_application',
                    type: 'ui-select-single',
                    templateOptions: {
                        optionsAttr: 'bs-options',
                        ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                        label: 'Call Application',
                        valueProp: 'application',
                        labelProp: 'application',
                        required: true,
                        showDetails: true,                        
                        options: vm.applications
                    },
                    watcher: {
                        listener: function(field, newValue, oldValue, scope) {
                            var i = vm.applications.getIndex('application', newValue);                           
                            if (i > 0) {
                                scope.fields[2].value(vm.applications[i].key_performance_indicator);
                            }
                        }
                    },
                    hideExpression: function($viewValue, $modelValue, scope) {
                        return vm.cfp_app_visible;
                    }
                },
                {
                    key: 'key_performance_indicator',
                    type: 'ui-select-single',
                    templateOptions: {
                        optionsAttr: 'bs-options',
                        ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                        label: 'Key Performance Indicator',
                        valueProp: 'id',
                        labelProp: 'name',
                        required: true,
                        options: vm.kpis
                    }
                },

                {
                    key: 'project_officer',
                    //type: 'ui-select-single',
                    type:'select',
                    templateOptions: {
                        //optionsAttr: 'bs-options',
                        //ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                        label: 'Project Officer',
                        valueProp: 'id',
                        labelProp: 'full_name',
                        required: true,
                        options: vm.persons
                    }
                }, {
                    className: 'row marginRow',
                    fieldGroup: [{
                        className: 'col-xs-6 nopadding',
                        key: 'start_date',
                        type: 'datepicker',
                        templateOptions: {
                            label: 'Start Date',
                            type: 'text',
                            datepickerPopup: 'yyyy-MM-dd'
                        }
                    }, {
                        className: 'col-xs-6 nopadding',
                        key: 'end_date',
                        type: 'datepicker',
                        templateOptions: {
                            label: 'End Date',
                            type: 'text',
                            datepickerPopup: 'yyyy-MM-dd'
                        }
                    }]
                }
            ]
        }
    }];

    vm.openProjBen = function() {

        $uibModal.open({
            templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
            controller: 'ManyToManyModalCtrl',
            size: 'lg',
            resolve: {
                configManyToMany: function() {
                    return {
                        modalTitle: 'Project Beneficiaries Types',

                        optionSearchPlaceholder: 'Search Beneficiary Types',
                        selectedSearchPlaceholder: 'Search Selected Beneficiary Types',

                        hybridTable: 'project_beneficiaries',
                        lookupHybridColumn: 'beneficiary',

                        singularColumn: 'project',
                        singularValue: vm.project.id,

                        lookupTable: 'beneficiaries',
                        lookupValueProp: 'id',
                        lookupLabelProp: 'type',

                        extraFields: [
                            {fieldName : 'males', type: 'number', label : 'Males',required : false},
                            {fieldName : 'females', type: 'number', label: 'Females',required : false}
                        ]
                    };
                }
            }
        }).result.then(function(result) {
            //do something with the result
        });

    };

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.project);
        //console.log(body);

        gprRestApi.updateCreateRow('projects', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.project.id = response.data.id;
            } else if (vm.operation === 'Update') {
                vm.project.id = response.data[0].id;
            }

            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };
    vm.deleteRow = function() {
        gprRestApi.deleteRow('projects', vm.project.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
