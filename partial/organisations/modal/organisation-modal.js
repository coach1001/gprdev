angular.module('appCg').controller('OrganisationModalCtrl', function($scope,organisation,
    referees,
    auditors,
    provinces,
    orgTypes,
    orgStatuses,
    /*
                                                                          suburbs,
                                                                          places,
    */
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance, $uibModal, $filter) {

    var vm = this;

    if (operation === 'Create') {
        vm.organisation = {};
    } else if (operation === 'Update') {
        vm.organisation = angular.extend(organisation);
    }

    vm.operation = angular.extend(operation);
    vm.referees = angular.extend(referees);
    vm.auditors = angular.extend(auditors);
    vm.provinces = angular.extend(provinces);
    vm.orgTypes = angular.extend(orgTypes);
    vm.orgStatuses = angular.extend(orgStatuses);
    vm.suburbs = [];
    vm.places = [];

    vm.tabs = [{
        title: 'General',
        active: true,
        form: {
            options: {},
            model: vm.organisation,
            fields: [{
                key: 'name',
                type: 'input',
                templateOptions: {
                    label: 'Organisation Name',
                    placeholder: 'Organisation Name',
                    required: true
                }
            }, {
                key: 'vat_no',
                type: 'input',
                templateOptions: {
                    label: 'VAT Number',
                    placeholder: 'VAT Number',
                    required: false
                }
            }, {
                key: 'npo_no',
                type: 'input',
                templateOptions: {
                    label: 'NPO Number',
                    placeholder: 'NPO Number',
                    required: false
                }
            }, {
                key: 'organisation_type',
                type: 'ui-select-single',
                templateOptions: {
                    optionsAttr: 'bs-options',
                    ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                    label: 'Organisation Type',
                    valueProp: 'id',
                    labelProp: 'type',
                    options: vm.orgTypes
                }
            }, {
                key: 'organisation_status',
                type: 'ui-select-single',
                templateOptions: {
                    optionsAttr: 'bs-options',
                    ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                    label: 'Organisation Status',
                    valueProp: 'id',
                    labelProp: 'status',
                    options: vm.orgStatuses
                }
            }]
        }
    }, {
        title: 'Contact',
        form: {
            options: {},
            model: vm.organisation,
            fields: [{
                template: '<button class="btn btn-success" ng-click="openPersonsSelectModal()">Edit Main Contact Person Details</button><br></br>',
                templateOptions: {},
                controller: ['$scope',function($scope) {
                    $scope.openPersonsSelectModal = function() {
                        vm.openPersonsSelectModal();
                    };
                }]
            }, {
                key: 'email_address',
                type: 'input',
                templateOptions: {
                    label: 'Email Address',
                    placeholder: 'Email Address',
                    type: 'email',
                    required: false
                }
            }, {
                key: 'cell_phone',
                type: 'input',
                templateOptions: {
                    label: 'Cell Phone Number',
                    placeholder: 'Cell Phone Number',
                    required: false
                }
            }, {
                key: 'work_phone',
                type: 'input',
                templateOptions: {
                    label: 'Work Phone Number',
                    placeholder: 'Work Phone Number',
                    required: false
                }
            }, {
                key: 'fax_no',
                type: 'input',
                templateOptions: {
                    label: 'Fax Number',
                    placeholder: 'Fax Number',
                    required: false
                }
            }]
        }
    }, {
        title: 'Location',
        form: {
            options: {},
            model: vm.organisation,
            fields: [{
                    key: 'street_first_line',
                    type: 'input',
                    templateOptions: {
                        label: 'Street Address',
                        placeholder: 'Line 1',
                        required: false
                    }
                }, {
                    key: 'street_second_line',
                    type: 'input',
                    templateOptions: {
                        placeholder: 'Line 2',
                        required: false
                    }
                }, {
                    key: 'postal_first_line',
                    type: 'input',
                    templateOptions: {
                        label: 'Postal Address',
                        placeholder: 'Line 1',
                        required: false
                    }
                }, {
                    key: 'postal_second_line',
                    type: 'input',
                    templateOptions: {
                        placeholder: 'Line 2',
                        required: false
                    }
                }, { //13 14 15
                    fieldGroup: [{
                        className: 'col-xs-4 nopadding',
                        key: 'province',
                        type: 'ui-select-single',
                        templateOptions: {
                            optionsAttr: 'bs-options',
                            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                            label: 'Province',
                            valueProp: 'id',
                            labelProp: 'name',
                            options: vm.provinces
                        },
                        watcher: {
                            listener: function(field, newValue, oldValue, scope) {
                                if (newValue !== oldValue) {
                                    vm.organisation.place = undefined;
                                    vm.organisation.suburb = undefined;
                                }
                                if (newValue) {
                                    //scope.fields[1].templateOptions.options = $filter('filter')(vm.places, {province: newValue});
                                    gprRestApi.getRowsFilterColumn('places', 'province', newValue).then(function success(response) {
                                        scope.fields[1].templateOptions.options = response;
                                    }, function error(response) {

                                    });

                                } else {
                                    scope.fields[1].templateOptions.options = [];
                                }
                            }
                        }
                    }, {
                        className: 'col-xs-4 nopadding',
                        key: 'place',
                        type: 'ui-select-single',
                        templateOptions: {
                            optionsAttr: 'bs-options',
                            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                            label: 'Place',
                            valueProp: 'id',
                            labelProp: 'name',
                            options: vm.places
                        },
                        watcher: {
                            listener: function(field, newValue, oldValue, scope) {
                                if (newValue !== oldValue) {
                                    vm.organisation.suburb = undefined;
                                }
                                if (newValue) {
                                    //scope.fields[2].templateOptions.options = $filter('filter')(vm.suburbs, {place: newValue});
                                    gprRestApi.getRowsFilterColumn('suburbs', 'place', newValue).then(function success(response) {
                                        scope.fields[2].templateOptions.options = response;
                                        //console.log(scope);
                                    }, function error(response) {});
                                } else {
                                    scope.fields[2].templateOptions.options = [];
                                }
                            }
                        }
                    }, {
                        className: 'col-xs-4 nopadding',
                        key: 'suburb',
                        type: 'select',
                        templateOptions: {

                            label: 'Suburb',
                            valueProp: 'id',
                            labelProp: 'name'
                        }
                    }]

                }


            ]
        }
    }, {
        title: 'Banking Details',
        form: {
            options: {},
            model: vm.organisation.bank_accounts,
            fields: [{
                template: '<button class="btn btn-success" ng-click="openBankDetails()">Edit Bank Details</button><br></br>',
                templateOptions: {},
                controller: function($scope) {
                    $scope.openBankDetails = function() {
                        vm.openBankDetails();
                    };
                }
            }]
        }
    }];

    vm.openBankDetails = function() {
        console.log('Open Bank Details');
    };
    
    /*vm.openMcpDetails = function() {        
        var operation = null;
        
        if(vm.organisation.main_contact_person){
          operation = 'Update';
        }else{
          operation = 'Create';
        }
        
        $uibModal.open({
            templateUrl: 'partial/persons/modal/person-modal.html',
            controller: 'PersonModalCtrl as vm',
            scope : $scope,            
            resolve: {
                person: function res(gprRestApi) {
                    return gprRestApi.getRow('persons', vm.organisation.main_contact_person);
                },
                roles: function res() {
                    return gprRestApi.getRows('lookup_roles', false);
                },
                operation: function res() {
                    return operation;
                },
                users: function res(gprRestApi) {
                    return gprRestApi.getRows('users', false);
                },
                contact : function res(){
                    return true;
                },
                assign : function res(){
                    return true;
                }
            }
        }).result.then(function(result) {
            vm.updateCreateRow();
        }, function(result) {
            vm.updateCreateRow();
        });

    };*/

    vm.openPersonsSelectModal = function() {
        var operation = null;

        if (vm.organisation.main_contact_person) {
            operation = 'Update';
        } else {
            operation = 'Create';
        }

        $uibModal.open({
            templateUrl: 'partial/persons/modal/person-select-modal.html',
            controller: 'PersonSelectModalCtrl as vm',
            scope: $scope,
            size: 'lg',
            resolve: {
                persons: function res(gprRestApi) {
                    return gprRestApi.getRows('grid_persons',false);
                },
                id : function res(){
                    return vm.organisation.main_contact_person;
                }
            }
        }).result.then(function(result) {            
            vm.organisation.main_contact_person = result.id;
            vm.updateCreateRow();
        }, function(result) {
            
        });
    };

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.organisation);
        delete body.bank_accounts;

        gprRestApi.updateCreateRow('organisations', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });

            if (vm.operation === 'Create') {
                vm.organisation.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('organisations', vm.organisation.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });


    };
});
