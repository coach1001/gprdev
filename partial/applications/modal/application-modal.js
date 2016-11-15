angular.module('appCg').controller('ApplicationModalCtrl', function($scope, $uibModal, application,
    organisations,    
    calls,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance, reporting,letterDetail,main_contact_person) {

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
        formState: {
            orgName: ''
        }
    };

      if(main_contact_person){
    vm.main_contact_person = angular.extend(main_contact_person);  
  }else{
    vm.main_contact_person = {};
  }

    vm.applicationFields = [{
            key: 'call',
            type: 'select',
            templateOptions: {
                label: 'Call Reference',
                valueProp: 'id',
                labelProp: 'call_reference',
                options: vm.calls,
                required : true,
            }
        }, {
            key: 'orgName',
            type: 'input',
            model: 'formState', // <-- this is available starting in 6.6.0... Normally this must be assigned to a literal object.
            templateOptions: {
                label: 'Search Organizations',
                placeholder: 'Search Organizations'
            }
        }, {
            key: 'applicant',
            type: 'select-list',
            templateOptions: {
                label: 'Applicant',
                valueProp: 'id',
                labelProp: 'name',
                required: true,
                options: vm.organisations,
                filterPlaceholder: 'Search Organizations',
                ngOptions: 'option.id as option.name for option in to.options | filter:formState.orgName'
            }
        }, {
            key: 'title',
            type: 'input',
            className: 'nopadding',
            templateOptions: {
                label: 'Project Title',
                placeholder: 'Project Name',                
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
        },{
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

          ]}
        /* {
                key: 'place',
                type: 'select',
                templateOptions: {
                    label: 'Place',
                    valueProp: 'id',
                    labelProp: 'name',
                    required: false,
                    options: vm.places
                }
            }*/
    ];


    vm.sendLetter = function(){
        var email_id=0;
        var to = [];
        var url = '';
        var filename = 'acknowledgment_letter_10001';
        var filetype = 'pdf';
        var subject = 'Foundation for Human Rights Correspondence - Acknowledgment of Receipt';
        var body= 'Please find attached your Acknowledgement of Receipt Letter\n\nRegards\nGrants Unit\nFoundation for Human Rights';
        var hasAtt = true;
        
        to.push('fweber@fhr.org.za');
        url=reporting.generateReport(1,[{'application_id' : 10001}],false);
        
        reporting.queueEmail(to[0],subject,body,hasAtt,filename,filetype,url).then(function success(response){
            email_id = response.data.id;            
            ngToast.create({ content: 'Email Queued Successfully!', timeout: 4000 });
            
        },function error(response){
            ngToast.warning({ content: 'Queueing Email Failed!', timeout: 4000 });

        });
        

        /*
        if(reporting.validateEmail(letterDetail.app_contact_email)){
        	to.push(letterDetail.app_contact_email);
        }
        if(reporting.validateEmail(letterDetail.email_address)){
         	to.push(letterDetail.email_address);   
        }
        if(reporting.validateEmail(letterDetail.org_contact_email)){
          to.push(letterDetail.email_address);  
        }*/
    };

    vm.generateFrontPage = function() {
        reporting.generateReport(0, [{ name: 'application_id_list', value: vm.application.id }],true);
    };

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.application);

        gprRestApi.updateCreateRow('call_applications', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.application.id = response.data.id;
            }

            //alfresco.createApplication(vm.call.key_performance_indicators.key_result_areas.programmes.code,vm.call.call_reference_path_safe);
            console.log(vm.application);

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
                    return gprRestApi.getRows('grid_persons', false);
                },
                id: function res() {
                    return vm.application.contact_person;
                },
                p_titles: function res(gprRestApi) {
                    return gprRestApi.getRows('personal_titles', false);
                }
            }
        }).result.then(function(result) {
            vm.application.contact_person = result.id;
            vm.main_contact_person = angular.extend(result);
            vm.applicationFields[6].fieldGroup[0].model= vm.main_contact_person;
            vm.applicationFields[6].fieldGroup[1].model= vm.main_contact_person;
            vm.applicationFields[6].fieldGroup[2].model= vm.main_contact_person;
            vm.updateCreateRow();
        }, function(result) {

        });

    };
    //console.log(vm);
});
