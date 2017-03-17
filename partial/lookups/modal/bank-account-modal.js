angular.module('appCg').controller('BankAccountModalCtrl',function(
		bank_account,banks,select,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    if (operation === 'Create') { vm.bankAccount = {}; } else if (operation === 'Update') { vm.bankAccount = angular.extend(bank_account); }

    vm.operation = angular.extend(operation);
    vm.banks = angular.extend(banks);
    vm.select = angular.extend(select);

    vm.bankAccountFields = [{

        fieldGroup: [{
            className: 'col-xs-4 nopadding',
            key: 'account_number',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Account Number',
                placeholder: 'Account Number',
                required: true
            }
        }, {
            className: 'col-xs-8 nopadding',
            key: 'account_name',
            type: 'input',
            templateOptions: {
                type: 'text',
                label: 'Account Name',
                placeholder: 'Account Name',
                required: true
            }
        }]
    },{
    	className: 'col-xs-12 nopadding',
    	key: 'bank',
    	type: 'select',
    	templateOptions:{
    		    label: 'Bank',
            valueProp: 'id',
            labelProp: 'label',
            required : true,
            options: vm.banks
    	}
    }];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.bankAccount);

        gprRestApi.updateCreateRow('bank_accounts', body, vm.operation).then(function success(response) {

            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });

            if (vm.operation === 'Create') { vm.bankAccount.id = response.data.id; }

            vm.operation = 'Update';
        }, function error() {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('bank_accounts', vm.bankAccount.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error() {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };

    vm.selectAccount = function(){
    		$uibModalInstance.close(vm.bankAccount.id);
    };
});
