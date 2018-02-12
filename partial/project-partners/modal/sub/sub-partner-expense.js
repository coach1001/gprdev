angular.module('appCg').controller('SubPartnerExpenseCtrl', function(project_expense,payment_types,
	operation,
	partner_id,
	gprRestApi,
	ngToast,
	$confirm,
	bank_accounts,
	partner_tranches,reporting,
	$uibModalInstance, $uibModal) {

	var vm = this;

	if (operation === 'Create') {
		vm.project_expense = {};
		vm.project_expense.project_partner = angular.extend(partner_id);
	} else if (operation === 'Update') {
		vm.project_expense = angular.extend(project_expense);
	}
	vm.operation = operation;
	vm.bank_accounts = angular.extend(bank_accounts);
	vm.partner_tranches = angular.extend(partner_tranches);
	vm.payment_types = angular.extend(payment_types);

	vm.tabs = [{
		title: 'Expense Details',
		index: 0,
		active: true,
		form: {
			options: {},
			model: vm.project_expense,
			fields: [{
				/*className: 'row marginRow',*/
				fieldGroup: [{
					className: 'col-xs-6 nopadding',
					key: 'request_date',
					type: 'datepicker',
					templateOptions: {
						label: 'Request Date',
						type: 'text',
						datepickerPopup: 'yyyy-MM-dd',
						required: true
					}
				}, {
					className: 'col-xs-6 nopadding',
					key: 'amount',
					type: 'input',
					templateOptions: {
						label: 'Amount Requested',
						type: 'number',
						required: true
					}
				}]
			}, {
				className: 'col-xs-12 nopadding',
				key: 'bank_account',
				type: 'select',
				templateOptions: {
					label: 'Bank Account',
					valueProp: 'id',
					labelProp: 'label',
					required: true,
					options: vm.bank_accounts
				}
			}, {
				template: '<button class="btn btn-success span4" ng-click="createBankAccount()">Create Bank Account</button><br><br>',
				controller: ['$scope', function($scope) {
					$scope.createBankAccount = function() {
						vm.openModalBankAccount(0, 'Create');
					};
				}]
			},{
				className: 'col-xs-12 nopadding',
				key: 'payment_type',
				type: 'select',
				templateOptions: {
					label: 'Payment Type',
					valueProp: 'id',
					labelProp: 'type',
					required: false,
					options: vm.payment_types
				}
			}, {
				fieldGroup: [{
					className: 'col-xs-6 nopadding',
					key: 'payment_schedule',
					type: 'select',
					templateOptions: {
						label: 'Tranche',
						valueProp: 'id',
						labelProp: 'label',
						required: true,
						options: vm.partner_tranches
					}
				}, {
					className: 'col-xs-6 nopadding',
					key: 'payment_reference',
					type: 'input',
					templateOptions: {
						type: 'text',
						label: 'Payment Reference',
						placeholder: 'Reference',
						required: true
					}
				}]
			}, {
				className: 'col-xs-12 nopadding',
				key: 'description',
				type: 'textarea',
				templateOptions: {
					type: 'text',
					rows: 2,
					label: 'Payment Description',
					placeholder: 'Description',
					required: false
				}
			}]
		}
	}];

	vm.openModalBankAccount = function(id, operation) {
		$uibModal.open({
			templateUrl: 'partial/lookups/modal/bank-account-modal.html',
			controller: 'BankAccountModalCtrl as vm',
			resolve: {
				select: function res() {
					return true;
				},
				banks: function res(gprRestApi) {
					return gprRestApi.getRows('lookup_banks_min', false);
				},
				bank_account: function res(gprRestApi) {
					return gprRestApi.getRow('bank_accounts', id, false);
				},
				operation: function res() {
					return operation;
				}
			}
		}).result.then(function(result) {

			gprRestApi.getRows('lookup_bank_accounts').then(function (res){
					vm.tabs[0].form.fields[1].templateOptions.options = vm.bank_accounts = angular.extend(res);
					vm.tabs[0].form.model.bank_account = result;
			});

		}, function(result) {


		});
	};

	vm.printReq = function() {
      //console.log(vm.project_expense);
      //console.log(vm.partner_tranches);
      reporting.generateReport(3, [
      { name: 'req_id_param', value: vm.project_expense.id },
      { name: 'tranche_id_param', value: vm.project_expense.payment_schedule }],true);

  };

	vm.updateCreateRow = function() {
		var body = angular.copy(vm.project_expense);
		body.project_partner = partner_id;

		gprRestApi.updateCreateRow('project_expenses', body, vm.operation).then(function success(response) {
			ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
			if (vm.operation === 'Create') {
				vm.project_expense.id = response.data.id;
			}
			vm.operation = 'Update';
		}, function error(response) {
			ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
		});
	};

	vm.deleteRow = function() {
		gprRestApi.deleteRow('project_expenses', vm.project_expense.id).then(function success(response) {
			ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
			$uibModalInstance.dismiss('Record Deleted');
		}, function error(response) {
			ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
		});
	};


	vm.openUploadPP = function(object,prop,title,filePrefix,fileIdentifier) {
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
	vm.openUploadID = function(object,prop,title,filePrefix,fileIdentifier) {
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
	vm.openUploadAD = function(object,prop,title,filePrefix,fileIdentifier) {
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
