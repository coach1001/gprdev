angular.module('appCg').controller('ProjectReviewModalCtrl', function(project_report,report_schedule,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    reporting,
    report_schedule_full,
    project_partner_full,
    $uibModalInstance,$uibModal,project_partner,project_payments_schedule) {

    var vm = this;

    //alert(report_schedule);

    if (operation === 'Create') {
        vm.project_report = {};
    } else if (operation === 'Update') {
        vm.project_report = angular.extend(project_report);
    }

    vm.project_report.report_schedule = report_schedule;
    vm.project_payments_schedule = angular.extend(project_payments_schedule);
    vm.operation = angular.extend(operation);
    vm.project_partner = angular.extend(project_partner);

    vm.report_schedule_full = angular.extend(report_schedule_full);
    vm.project_partner_full = angular.extend(project_partner_full);

    console.log(vm.report_schedule_full,vm.project_partner_full);

    vm.project_reportFields = [
    {
        key: 'review_date',
        type: 'datepicker',
        templateOptions: {
            label: 'Review Date',
            type: 'text',
            datepickerPopup: 'yyyy-MM-dd',
            required: true
        }
    }, {
        key: 'objectives',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Objectives',
            rows: 3,
            required: true
        }
    },{
        key: 'summary_of_assessment',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Summary of Assessment',
            rows: 3,
            required: false
        }
    },{
        key: 'recommendation',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Recommendation',
            rows: 3,
            required: false
        }
    },{
    fieldGroup: [
    {
        className: 'col-xs-2 nopadding',
        key: 'recommend_payment',
        type: 'checkbox2',
        templateOptions: {
            label: 'Recommend Payment ?',
        }
    },
    {
      className: 'col-xs-5 nopadding',
      key: 'tranche_to_pay',
      type: 'select',
      templateOptions: {
        label: 'Tranche ?',
        valueProp: 'id',
        labelProp: 'label',
        options: vm.project_payments_schedule,
        required: false
        }
    }, {
      className: 'col-xs-5 nopadding',
      key: 'ammend_payment',
      type: 'input',
      templateOptions: {
        type: 'number',
        label: 'Ammend Amount ?',
        placeholder: '',
        required: false
      }
    }
    ]},
    {
        key: 'recommend_extension',
        type: 'checkbox2',
        templateOptions: {
            label: 'Recommend Extension ?',
        }
    },  {
            template: '<button class="btn btn-success" ng-click="openReportOnImplementation()">Implementation Plan Review</button><br></br>',
            templateOptions: {},
            hideExpression: function($viewValue, $modelValue, scope) {
                if (vm.operation === 'Create') {
                    return true;
                } else { return false;}
            },
            controller: ['$scope', function($scope) {
                $scope.openReportOnImplementation = function() {
                    vm.openReportOnImplementation();
                };
            }]
        }
    ];

    vm.openReportOnImplementation = function() {
        $uibModal.open({
            templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
            controller: 'ManyToManyModalCtrl',
            size: 'lg',
            //windowClass: 'large-width',
            resolve: {
                configManyToMany: function() {
                    return {
                        modalTitle: 'Review Implementation Plan',

                        optionSearchPlaceholder: 'Search Implementation Plan Items',
                        selectedSearchPlaceholder: 'Search Selected Implementation Plan Items',

                        hybridTable: 'report_on_implementation',
                        lookupHybridColumn: 'implementation_plan_item',

                        singularColumn: 'project_report',
                        singularValue: vm.project_report.id,

                        lookupTable: 'lookup_project_implementation_plan',
                        lookupValueProp: 'id',
                        lookupLabelProp: 'item_label_budget',
                        lookupParam: '?project_partner=eq.' + vm.project_partner,

                        //extraFields: [],
                        extraFields: [
                            {fieldName : 'achieved_implemented', type: 'text', label : 'Achieved/Implemented',required : false, default: ' '},
                            {fieldName : 'impact', type: 'text', label : 'Impact',required : false, default: ' '},
                            {fieldName : 'expenditure', type: 'number', label: 'Expenditure',required : false}
                        ]
                    };
                }
            }
        }).result.then(function(result) {
            //do something with the result
        });
    };

    vm.printReview = function() {
      reporting.generateReport(4, [{ name: 'project_review_id', value: vm.project_report.id }], true);
    };

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.project_report);

        gprRestApi.updateCreateRow('project_reports', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.project_report.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };
    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_reports', vm.project_report.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
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
});
