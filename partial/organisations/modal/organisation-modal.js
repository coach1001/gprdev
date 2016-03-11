angular.module('appCg').controller('OrganisationModalCtrl', function(
    organisation,
    referees,
    auditors,
    provinces,
    orgTypes,
    orgStatuses,
    suburbs,
    places,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,$filter) {

    var vm = this;

    if (operation === 'Create') { vm.organisation = {}; } else if (operation === 'Update') { vm.organisation = organisation.selectedRow; }

    vm.operation = angular.extend(operation);
    vm.referees = angular.extend(referees.rows);
    vm.auditors = angular.extend(auditors.rows);
    vm.provinces = angular.extend(provinces.rows);
    vm.orgTypes = angular.extend(orgTypes.rows);
    vm.orgStatuses = angular.extend(orgStatuses.rows);
    vm.suburbs = angular.extend(suburbs.rows);
    vm.places = angular.extend(places.rows);

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
                },
                {//13 14 15
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
                                if (newValue !== oldValue) { vm.organisation.place = undefined;vm.organisation.suburb = undefined; }
                                console.log(scope);
                                if (newValue) {
                                    scope.fields[1].templateOptions.options = $filter('filter')(vm.places, { province: newValue });
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
                                if (newValue !== oldValue) { vm.organisation.suburb = undefined; }
                                console.log(scope);
                                if (newValue) {
                                    scope.fields[2].templateOptions.options = $filter('filter')(vm.suburbs, { place: newValue });
                                } else {
                                    scope.fields[2].templateOptions.options = [];
                                }
                            }
                        }
                    }, {
                        className: 'col-xs-4 nopadding',
                        key: 'suburb',
                        type: 'ui-select-single',
                        templateOptions: {
                            optionsAttr: 'bs-options',
                            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                            label: 'Suburb',
                            valueProp: 'id',
                            labelProp: 'name',
                            options: vm.suburbs
                        }
                    }]
                }


            ]
        }
    }, {
        title: 'Banking Details',
        form: {
            options: {},
            model: vm.organisation,
            fields: [{
                key: 'name',
                type: 'input',
                templateOptions: {
                    label: 'First Name',
                    required: true
                }
            }]
        }
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.organisation);

        gprRestApi.updateCreateRow('organisations', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.organisation.id = response.data.id; }

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