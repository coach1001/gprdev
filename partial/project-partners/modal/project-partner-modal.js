angular.module('appCg').controller('ProjectPartnerModalCtrl', function(project_partner,$uibModal,
    project_id,
    persons,
    organisations,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') {
        vm.project_partner = {};
    } else if (operation === 'Update') {
        vm.project_partner = angular.extend(project_partner);
    }

    vm.operation = operation;
    vm.project_id = project_id;
    vm.person_visible = false;
    vm.org_visible = false;

    vm.persons = angular.extend(persons);
    vm.organisations = angular.extend(organisations);


    if (vm.project_partner.person === null) {
        vm.project_partner.partner_type = 1;
    } else {
        vm.project_partner.partner_type = 0;
    }

/*    vm.optionsPartners = {
        formState: {
            filter: ''
        }
    };
*/
    vm.project_partnerFields = [
        {
            key: 'partner_type',
            type: 'ui-select-single',
            templateOptions: {
                optionsAttr: 'bs-options',
                ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                label: 'Partner Type',
                valueProp: 'val',
                labelProp: 'desc',
                required: true,
                options: [{ val: 0, desc: 'Person' }, { val: 1, desc: 'Organisation' }]
            },
            watcher: {
                listener: function(field, newValue, oldValue, scope) {
                    if (newValue === 0) {
                        vm.person_visible = false;
                        vm.org_visible = true;
                    } else if (newValue === 1) {
                        vm.org_visible = false;
                        vm.person_visible = true;
                    }
                }
            }
        },
        /* {
                    key: 'organisation',
                    type: 'ui-select-single',
                    templateOptions: {
                        optionsAttr: 'bs-options',
                        ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                        label: 'Organisation',
                        valueProp: 'id',
                        labelProp: 'name',
                        required: true,
                        disabled:true,
                        options: vm.organisations
                    },
                    hideExpression: function($viewValue, $modelValue, scope) {
                    	  return vm.org_visible;
                    }
                },*/
        {
            key: 'filter',
            type: 'input',
            model: 'formState', // <-- this is available starting in 6.6.0... Normally this must be assigned to a literal object.
            templateOptions: {
                //label: 'Search Organizations',
                placeholder: 'Search Organizations'
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                return vm.org_visible;
            }

        }, {
            key: 'organisation',
            type: 'select-list',
            templateOptions: {
                valueProp: 'id',
                labelProp: 'name',
                required: true,
                options: vm.organisations,
                filterPlaceholder: 'Search Organizations',
                ngOptions: 'option.id as option.name for option in to.options | filter:formState.filter'
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                return vm.org_visible;
            }
        }, {
            key: 'filter',
            type: 'input',
            model: 'formState', // <-- this is available starting in 6.6.0... Normally this must be assigned to a literal object.
            templateOptions: {
                //label: 'Search Persons',
                placeholder: 'Search Person'
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                return vm.person_visible;
            }

        }, {
            key: 'person',
            type: 'select-list',
            templateOptions: {
                valueProp: 'id',
                labelProp: 'name',
                required: true,
                options: vm.persons,
                filterPlaceholder: 'Search Person',
                ngOptions: 'option.id as option.name for option in to.options | filter:formState.filter'
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                return vm.person_visible;
            }
        }
    ];
    


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.project_partner);
        var partner_type = angular.extend(vm.project_partner.partner_type);

        if (partner_type === 0) {
            body.organisation = null;
        } else if (partner_type === 1) {
            body.person = null;
        }

        delete body.partner_type;
        body.project = project_id;

        gprRestApi.updateCreateRow('project_partners', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.project_partner.id = response.data.id;
            } else if (vm.operation === 'Update') {
                vm.project_partner = response.data[0];
                vm.project_partner.partner_type = partner_type;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });


    };
    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_partners', vm.project_partner.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };
});
