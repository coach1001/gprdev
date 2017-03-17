angular.module('appCg').controller('OrganisationModalCtrl', function($scope, organisation,
  referees,
  auditors,
  provinces,
  orgTypes,
  orgStatuses,
  main_contact_person,
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

  vm.orgTypes = angular.extend(orgTypes);
  vm.orgStatuses = angular.extend(orgStatuses);

  vm.street_provinces = angular.extend(provinces);
  vm.street_suburbs = [];
  vm.street_places = [];

  vm.postal_provinces = angular.extend(provinces);
  vm.postal_suburbs = [];
  vm.postal_places = [];

  if(main_contact_person){
    vm.main_contact_person = angular.extend(main_contact_person);  
  }else{
    vm.main_contact_person = {};
  }
  
  
  console.log(vm.main_contact_person);

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
            placeholder: '000-000-NPO',
            required: false
          },
          validators: {
            npo_no_validate: {
              expression: function(viewValue, modelValue, scope) {
                var value = modelValue ||  viewValue;
                if(value){
                  return /[0-9][0-9][0-9]-[0-9][0-9][0-9]-NPO/.test(value);
                }else{
                  return true;
                }
              },
              message : '$viewValue + "is not a Valid NPO Number"'
            }
          }
        }, {
          template: '<button class="btn btn-success" ng-click="openOrgTypeModal()">Edit Organisation Type</button><br></br>',
          hideExpression: function($viewValue, $modelValue, scope) {
            if (vm.operation === 'Create') {
              return true;
            } else {}
          },
          controller: ['$scope', function($scope) {
            $scope.openOrgTypeModal = function() {
              vm.openOrgTypeModal();
            };
          }]
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
          hideExpression: function($viewValue, $modelValue, scope) {
            if (vm.operation === 'Create') {
              return true;
            } else {}
          },
          controller: ['$scope', function($scope) {
            $scope.openPersonsSelectModal = function() {
              vm.openPersonsSelectModal();
            };
          }]
        }, 
          {
            fieldGroup: [
              
              {
                className: 'col-xs-4 nopadding',
                key: 'full_name',
                type: 'input',
                model: vm.main_contact_person,
                templateOptions:{
                  label : 'Main Contact Name',
                  disabled: true
                }
              },

              {
                className: 'col-xs-4 nopadding',
                key: 'email_address',
                type: 'input',
                model: vm.main_contact_person,
                templateOptions:{
                  label : 'Main Contact Email',
                  disabled: true
                }
              },

              {
                className: 'col-xs-4 nopadding',
                key: 'cell_phone',
                type: 'input',
                model: vm.main_contact_person,
                templateOptions:{
                  label : 'Main Contact Cell',
                  disabled: true
                }
              }

          ]},
        {
          key: 'email_address',
          type: 'input',
          templateOptions: {
            label: 'Email Address',
            placeholder: 'Email Address',
            type: 'email',
            required: true
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
        }, { //13 14 15
          fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'street_province',
            type: 'ui-select-single',
            templateOptions: {
              optionsAttr: 'bs-options',
              ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
              label: 'Street Province',
              valueProp: 'id',
              labelProp: 'name',
              options: vm.street_provinces
            },
            watcher: {
              listener: function(field, newValue, oldValue, scope) {
                if (newValue !== oldValue) {
                  vm.organisation.street_place = undefined;
                  vm.organisation.street_suburb = undefined;
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
            key: 'street_place',
            type: 'ui-select-single',
            templateOptions: {
              optionsAttr: 'bs-options',
              ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
              label: 'Street Place',
              valueProp: 'id',
              labelProp: 'name',
              options: vm.street_places
            },
            watcher: {
              listener: function(field, newValue, oldValue, scope) {
                if (newValue !== oldValue) {
                  vm.organisation.street_suburb = undefined;
                }
                if (newValue) {
                  //scope.fields[2].templateOptions.options = $filter('filter')(vm.suburbs, {place: newValue});
                  gprRestApi.getRowsFilterColumn('lookup_suburbs', 'place', newValue).then(function success(response) {
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
            key: 'street_suburb',
            type: 'select',
            templateOptions: {

              label: 'Street Suburb',
              valueProp: 'id',
              labelProp: 'street_label'
            }
          }]

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
            key: 'postal_province',
            type: 'ui-select-single',
            templateOptions: {
              optionsAttr: 'bs-options',
              ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
              label: 'Postal Province',
              valueProp: 'id',
              labelProp: 'name',
              options: vm.postal_provinces
            },
            watcher: {
              listener: function(field, newValue, oldValue, scope) {
                if (newValue !== oldValue) {
                  vm.organisation.postal_place = undefined;
                  vm.organisation.postal_suburb = undefined;
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
            key: 'postal_place',
            type: 'ui-select-single',
            templateOptions: {
              optionsAttr: 'bs-options',
              ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
              label: 'Postal Place',
              valueProp: 'id',
              labelProp: 'name',
              options: vm.postal_places
            },
            watcher: {
              listener: function(field, newValue, oldValue, scope) {
                if (newValue !== oldValue) {
                  vm.organisation.postal_suburb = undefined;
                }
                if (newValue) {
                  //scope.fields[2].templateOptions.options = $filter('filter')(vm.suburbs, {place: newValue});
                  gprRestApi.getRowsFilterColumn('lookup_suburbs', 'place', newValue).then(function success(response) {
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
            key: 'postal_suburb',
            type: 'select',
            templateOptions: {

              label: 'Postal Suburb',
              valueProp: 'id',
              labelProp: 'box_label'
            }
          }]

        }]
      }
    }
    /*, {
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
        }*/
  ];

  vm.openOrgTypeModal = function() {

    $uibModal.open({
      templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
      controller: 'ManyToManyModalCtrl',
      size : 'lg',
      resolve: {
        configManyToMany: function() {
          return {
            modalTitle: 'Organisation Types',

            optionSearchPlaceholder: 'Search Types',
            selectedSearchPlaceholder: 'Search Selected Types',

            hybridTable: 'organisation_has_types',
            lookupHybridColumn: 'type',

            singularColumn: 'organisation',
            singularValue: vm.organisation.id,

            lookupTable: 'organisation_types',
            lookupValueProp: 'id',
            lookupLabelProp: 'type'
          };
        }
      }
    }).result.then(function(result) {
      //do something with the result
    });

  };

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
          return gprRestApi.getRows('grid_persons', false);
        },
        id: function res() {
          return vm.organisation.main_contact_person;
        },
        p_titles : function res(gprRestApi){
          return gprRestApi.getRows('personal_titles',false);
        }
      }
    }).result.then(function(result) {
      vm.organisation.main_contact_person = result.id;
      vm.main_contact_person = angular.extend(result);
      
      vm.tabs[1].form.fields[1].fieldGroup[0].model = vm.main_contact_person;
      vm.tabs[1].form.fields[1].fieldGroup[1].model = vm.main_contact_person;
      vm.tabs[1].form.fields[1].fieldGroup[2].model = vm.main_contact_person;
         

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

  console.log(vm.tabs);
});
