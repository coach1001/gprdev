angular.module('appCg').controller('ApplicationModalCtrl', function($scope,$uibModal,application,
    organisations,
    //places,
    calls,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,reporting) {

    var vm = this;

    if (operation === 'Create') {
        vm.kra = {};
    } else if (operation === 'Update') {
        vm.application = angular.extend(application);
    }

    vm.operation = angular.extend(operation);
    vm.organisations = angular.extend(organisations);
    //vm.places = angular.extend(places);
    vm.calls = angular.extend(calls);
    
    vm.applicationOptions = {
        formState :{
            orgName: ''
        }
    };
    
        
    vm.applicationFields = [{
        key: 'call',
        type: 'select',        
        templateOptions: {
            label: 'Call Reference',
            valueProp: 'id',
            labelProp: 'call_reference',
            options: vm.calls
        }
    },{
        key: 'orgName',
        type: 'input',
        model: 'formState', // <-- this is available starting in 6.6.0... Normally this must be assigned to a literal object.
        templateOptions: {
          label: 'Search Organizations',
          placeholder: 'Search Organizations'
        }      
    },{
        key: 'applicant',        
        type: 'select-list',        
        templateOptions: {            
            label: 'Applicant',
            valueProp: 'id',                        
            labelProp: 'name',
            required: true,            
            options: vm.organisations,
            filterPlaceholder : 'Search Organizations',            
            ngOptions: 'option.id as option.name for option in to.options | filter:formState.orgName'
        }
    }, {
        key: 'title',
        type: 'textarea',
        className: 'nopadding',
        templateOptions: {
            label: 'Project Title',
            placeholder: 'Project Name',
            rows: 2,            
            required: false
        }
    }, {
        key: 'amount',
        type: 'input',
        templateOptions: {
            label: 'Amount Requested',
            type: 'number',
            required: true
        }
    }, {
        template: '<button class="btn btn-success" ng-click="openPersonsSelectModal()">Edit Main Contact Person Details</button><br></br>',
        templateOptions: {},
        controller: ['$scope', function($scope) {
            $scope.openPersonsSelectModal = function() {
                vm.openPersonsSelectModal();
            };
        }]
    },/* {
        key: 'place',
        type: 'select',
        templateOptions: {
            label: 'Place',
            valueProp: 'id',
            labelProp: 'name',
            required: false,
            options: vm.places
        }
    }*/];

    vm.generateFrontPage = function(){
        reporting.generateReport(0,[{name : 'application_id_list', value : vm.application.id}]);
    };

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.application);

        gprRestApi.updateCreateRow('call_applications', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.application.id = response.data.id;
            }
            vm.operation = 'Update';
        }, function error() {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('call_applications', vm.application.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error() {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };

    vm.promote = function() {
        vm.application.application_status = 2;
        var body = angular.copy(vm.application);
        gprRestApi.updateCreateRow('call_applications', body, 'Update').then(function success(response) {
            ngToast.create({ content: 'Record Promoted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Promoted');
        }, function error() {
            ngToast.warning({ content: 'Record Promotion Failed', timeout: 4000 });
        });
    };

    vm.fail = function() {
        vm.application.application_status = 21;
        var body = angular.copy(vm.application);
        gprRestApi.updateCreateRow('call_applications', body, 'Update').then(function success(response) {
            ngToast.warning({ content: 'Record Failed Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Failed');
        }, function error() {
            ngToast.warning({ content: 'Record Failure Failed', timeout: 4000 });
        });
    };

    vm.openPersonsSelectModal = function() {
        var operation = null;

        if (vm.application.contact_person) {
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
                    return vm.application.contact_person;
                }
            }
        }).result.then(function(result) {            
            vm.application.contact_person = result.id;
            vm.updateCreateRow();
        }, function(result) {
            
        });

    };
    //console.log(vm);
});
