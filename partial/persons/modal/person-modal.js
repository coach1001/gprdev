angular.module('appCg').controller('PersonModalCtrl', function($scope,person,
    users,
    roles,
    contact,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance,
    assign,p_titles) {

    var vm = this;

    vm.contact = angular.copy(contact);
    console.log($scope);

    if (operation === 'Create') {
        vm.person = {};

    } else if (operation === 'Update') {
        vm.person = angular.extend(person);
    }

    vm.assign = angular.copy(assign);

    vm.roles = angular.extend(roles);
    vm.users = angular.extend(users);

    vm.operation = operation;
    vm.p_titles = angular.copy(p_titles);

    vm.personFields = [{
            key: 'application_user',
            type: 'checkbox2',
            templateOptions: {
                label: 'Application User',
                default: false,
                required: false
            },
            watcher: {
                listener: function(field, newValue, oldValue, scope) {
                    if (newValue === false) {
                        vm.person.login_email = '';
                    }
                }
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                return vm.contact;
            }
        }, {
            key: 'login_email',
            type: 'select',
            templateOptions: {
                label: 'Login',
                valueProp: 'email',
                labelProp: 'email',
                placeholder: 'Role',
                required: true,
                options: vm.users,
            },
            hideExpression: function($viewValue, $modelValue, scope) {
                if(vm.contact){
                 return true;                    
                }
                else {return !vm.person.application_user;}
            }
        }, {
            key : 'personal_title',
            type : 'select',
            templateOptions : {
                label : 'Personal Title',
                valueProp : 'id',
                labelProp : 'title',
                options : vm.p_titles
            }
        },{
            key: 'first_names',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'First Names',
                placeholder: 'First Names',
                required: true
            }
        }, {
            key: 'last_name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Last Name',
                placeholder: 'Last Name',
                required: true
            }
        }, {
            key: 'email_address',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Email Address',
                placeholder: 'Email Address',
                required: true
            }
        },
        /*{
                key: 'role',
                type: 'select',
                templateOptions: {
                    label: 'Role',
                    valueProp: 'rolname',
                    labelProp: 'rolname',
                    placeholder: 'Role',
                    required: false,
                    options: vm.roles}}*/
        {
            key: 'cell_phone',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Cell Phone Number',
                placeholder: '000-000-0000',
                required: false
            }
        }, {
            key: 'work_phone',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Work Phone Number',
                placeholder: '000-000-0000',
                required: false
            }

        }
    ];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.person);
        gprRestApi.updateCreateRow('persons', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.person.id = response.data.id;                
                
                if(vm.contact){
                    $scope.$parent.vm.organisation.main_contact_person = vm.person.id;
                    //console.log('The Fuck');                    
                }            
            
            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('persons', vm.person.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };

});
