angular.module('appCg').controller('EvcMeetingApplicationModalCtrl', function(evcApplication, application,
	evcApplicationLookup,
	evcId,
	operation,
	gprRestApi,
	ngToast,
	$confirm,
	$uibModalInstance) {

	var vm = this;

	if (operation === 'Create') {
		vm.evcApplication = {};
		vm.evcApplication.evc = angular.extend(evcId);
	} else if (operation === 'Update') {
		vm.evcApplication = angular.extend(evcApplication);
	}
	vm.evcApplicationLookup = angular.extend(evcApplicationLookup);
	if (application) {
		vm.application = angular.extend(application);
		if (application.application_status === 7) {
			vm.disabled = false;
		} else {
			vm.disabled = true;
		}
	}
	else{
		vm.application = {};
	}



	vm.operation = operation;
	vm.evcApplicationFields = [{
		key: 'application',
		type: 'ui-select-single',
		templateOptions: {
			optionsAttr: 'bs-options',
			ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
			label: 'Application',
			valueProp: 'application',
			labelProp: 'application',
			showDetails: true,
			options: vm.evcApplicationLookup

		}
	}, {
		key: 'approved',
		type: 'checkbox2',
		templateOptions: {
			label: 'Approved ?',
		}
	}, {
		key: 'amount_approved',
		type: 'input',
		templateOptions: {
			label: 'Amount Approved',
			type: 'number'
		}
	}, {
		key: 'decision_timestamp',
		type: 'timepicker',
		templateOptions: {
			label: 'Decision Take At - Time'
		}
	}, {
		key: 'decision_narrative',
		type: 'textarea',
		templateOptions: {
			label: 'Decision Narrative',
			placeholder: 'Decision Narrative',
			rows: 4,
			required: false
		}
	}];

	vm.updateCreateRow = function() {
		var body = angular.copy(vm.evcApplication);
		//console.log(body);
		gprRestApi.updateCreateRow('evc_applications', body, vm.operation).then(function success(response) {
			ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
			
			if (vm.operation === 'Create') {
				vm.evcApplication.id = response.data.id;				
				gprRestApi.getRow('call_applications',response.data.application,false).then(function success(response_){
					vm.application = response_;
				});
			}

			vm.operation = 'Update';

		}, function error(response) {
			ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
		});
	};
	vm.deleteRow = function() {
		gprRestApi.deleteRow('evc_applications', vm.evcApplication.id).then(function success(response) {
			ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
			$uibModalInstance.dismiss('Record Deleted');
		}, function error(response) {
			ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
		});
	};


	vm.promote = function() {		
		vm.updateCreateRow();		
									
		$confirm({
			title: 'Promote Application?',
			text: 'Warning : You will only be able to view data from this section after promotion',
			ok: 'Yes',
			cancel: 'No'
		}).then(function(res) {
			gprRestApi.runRPC('promote_application', { application: vm.application.id, current_section: vm.application.application_status }).then(
				function success(res) {					
					$uibModalInstance.dismiss('');
				},
				function error(res) {});
		});
	};
	
	vm.fail = function() {
		vm.updateCreateRow();
		$confirm({
			title: 'Fail Application',
			text: 'Are you sure ?',
			ok: 'Yes',
			cancel: 'No'
		}).then(function(res) {
			gprRestApi.runRPC('fail_application', { application: vm.application.id, current_section: vm.application.application_status }).then(function success(res) {
				$uibModalInstance.dismiss('');
				//$state.go('home.home.evc-meetings');  
			}, function error(res) {});
		});

	};

});
