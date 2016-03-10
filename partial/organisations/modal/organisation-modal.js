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
    $uibModalInstance) {

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

    //console.log(vm.provinces);

    /*vm.organisationFields = [{
            key: 'name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Organisation Name',
                placeholder: 'Organisation Name',
                required: true
            }
        }, {
            key: 'province',
            type: 'ui-select-single',
            templateOptions: {
                optionsAttr: 'bs-options',
                ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                label: 'Province',
                valueProp: 'id',
                labelProp: 'name',
                required: false,
                options: vm.provinces
            }
        }
        /*
                , {
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
                    }second
    ];*/
    //vm.model = {};

    vm.tabs = [
      {
        title: 'General Information',
        active: true,
        form: {
          options: {},
          model: vm.organisation,
          fields: [
            {
              key: 'email_address',
              type: 'input',
              templateOptions: {
                label: 'Organisation Email',
                type: 'email',
                placeholder: 'Organisation Email',
                required: true
              }
            }
          ]
        }
      },
      {
        title: 'Contact Details',
        form: {
          options: {},
          model: vm.organisation,
          fields: [
            {
              key: 'name',
              type: 'input',
              templateOptions: {
                label: 'First Name',
                required: true
              }
            },
            {
              key: 'lastName',
              type: 'input',
              templateOptions: {
                label: 'Last Name',
                required: true
              }
            }
          ] 
        }
      }
    ];

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
