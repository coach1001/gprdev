angular.module('appCg').controller('ProjectModalCtrl', function(project, kpis, persons, project_statuses, project_types, applications, operation,
  gprRestApi,
  ngToast,
  $confirm,
  $uibModalInstance, $uibModal, titles_descriptions) {

  var vm = this;

  vm.kpis = angular.extend(kpis);
  vm.applications = angular.extend(applications);
  vm.persons = angular.extend(persons);
  vm.project_types = angular.extend(project_types);
  vm.cfp_app_visible = true;
  vm.titles_descriptions = angular.extend(titles_descriptions);

  if (operation === 'Create') {
    vm.project = {};
  } else if (operation === 'Update') {
    vm.project = angular.extend(project);
  }
  vm.operation = angular.extend(operation);

  vm.tabs = [
  {
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
              vm.openProjAct();
            };
            $scope.openProjTh = function() {
              vm.openProjTh();
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
              titles_descriptions.find( function (val){
                if(val.application === newValue){
                  if(vm.project.name === null || vm.project.name === '' || vm.project.name === undefined){
                    vm.tabs[0].form.fields[0].value(val.project_Title);
                  }
                  if(vm.project.description === null || vm.project.description === '' || vm.project.description === undefined){
                    vm.tabs[0].form.fields[1].value(val.project_description);
                  }
                }
              });
              var i = vm.applications.getIndex('application', newValue);
              if (i > 0) {
                vm.tabs[1].form.fields[2].value(vm.applications[i].key_performance_indicator);
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
          type: 'select',
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
              { fieldName: 'males', type: 'number', label: 'Males', required: false },
              { fieldName: 'females', type: 'number', label: 'Females', required: false }
            ]
          };
        }
      }
    }).result.then(function(result) {
      //do something with the result
    });
  };
  vm.openProjAct = function() {
    $uibModal.open({
      templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
      controller: 'ManyToManyModalCtrl',
      size: 'lg',
      resolve: {
        configManyToMany: function() {
          return {
            modalTitle: 'Project Activities Types',

            optionSearchPlaceholder: 'Search Activity Types',
            selectedSearchPlaceholder: 'Search Selected Activity Types',

            hybridTable: 'project_activities',
            lookupHybridColumn: 'activity',

            singularColumn: 'project',
            singularValue: vm.project.id,

            lookupTable: 'activities',
            lookupValueProp: 'id',
            lookupLabelProp: 'type',

            extraFields: [],
            /*extraFields: [
                {fieldName : 'males', type: 'number', label : 'Males',required : false},
                {fieldName : 'females', type: 'number', label: 'Females',required : false}
            ]*/
          };
        }
      }
    }).result.then(function(result) {
      //do something with the result
    });
  };
  vm.openProjTh = function() {
    $uibModal.open({
      templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
      controller: 'ManyToManyModalCtrl',
      size: 'lg',
      resolve: {
        configManyToMany: function() {
          return {
            modalTitle: 'Project Theme Types',

            optionSearchPlaceholder: 'Search Theme Types',
            selectedSearchPlaceholder: 'Search Selected Theme Types',

            hybridTable: 'project_themes',
            lookupHybridColumn: 'theme',

            singularColumn: 'project',
            singularValue: vm.project.id,

            lookupTable: 'themes',
            lookupValueProp: 'id',
            lookupLabelProp: 'type',

            extraFields: [],
            /*extraFields: [
                {fieldName : 'males', type: 'number', label : 'Males',required : false},
                {fieldName : 'females', type: 'number', label: 'Females',required : false}
            ]*/
          };
        }
      }
    }).result.then(function(result) {
      //do something with the result
    });
  };

  
  vm.openUpload = function(object,prop,title,filePrefix,fileIdentifier) {
    var fileId = vm[object][prop];
    var createFile = false;
    var fileName = filePrefix+fileIdentifier;

    if(fileId === null){
      createFile = true;
      fileId = 0;
    }else{
      createFile = false;
    }
    $uibModal.open({
        templateUrl: 'partial/upload-file/upload-file.html',
        controller: 'UploadFileCtrl',
        windowClass: 'large-width',
        backdrop  : 'static',
        keyboard  : false,
        resolve: {
          fileId: fileId,
          createFile: createFile,
          title: function() {
              return title;
          },
          saveName: function() {
              return fileName;
          }
        }
    }).result.then(function(res) {
      vm[object][prop] = res.data.fileId;
      vm.updateCreateRow();
    }, function(res){
      if(res.fileDeleted)
      {
        vm[object][prop] = null;
        vm.updateCreateRow();
      }else{
        vm[object][prop] = res.fileId;
        vm.updateCreateRow();
      }
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
