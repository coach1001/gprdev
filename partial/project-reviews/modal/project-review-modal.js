angular.module('appCg').controller('ProjectReviewModalCtrl', function(project_report,report_schedule,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,$uibModal,project_partner) {

    var vm = this;
    
    //alert(report_schedule);

    if (operation === 'Create') {
        vm.project_report = {};
    } else if (operation === 'Update') {
        vm.project_report = angular.extend(project_report);
    }
    
    vm.project_report.report_schedule = report_schedule;
    
    vm.operation = angular.extend(operation);
    vm.project_partner = angular.extend(project_partner);

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
        key: 'narrative',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'General Narrative',
            placeholder: 'Review',
            rows: 3,
            required: true
        }
    },{
        key: 'impact',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Impact',
            placeholder: 'Impact',
            rows: 3,
            required: true
        }
    },{
        key: 'final_recommendation',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Recommendation',
            placeholder: 'Review',
            rows: 3,
            required: true
        }
    }, {
        key: 'satisfactory',
        type: 'checkbox2',
        templateOptions: {
            label: 'Satisfactory ?',
        }
    }, {
        key: 'recommend_payment',
        type: 'checkbox2',
        templateOptions: {
            label: 'Recommend Payment ?',
        }
    }, {
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

                        lookupTable: 'project_implementation_plans',
                        lookupValueProp: 'id',
                        lookupLabelProp: 'item',
                        lookupParam: '?project_partner=eq.' + vm.project_partner,
                        
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
});
